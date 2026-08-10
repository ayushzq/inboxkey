/**
 * Node's built-in http/https modules (and most libraries built on top of
 * them, including axios) do NOT automatically respect HTTP_PROXY /
 * HTTPS_PROXY environment variables - that convention only works if
 * something patches the global agent to read them.
 *
 * `global-agent` does exactly that, process-wide, and it reads its own
 * GLOBAL_AGENT_* variables. We bootstrap it once per container and then,
 * on every request, mirror our rotated HTTP_PROXY / HTTPS_PROXY values
 * into the GLOBAL_AGENT_* variables it understands. This way the rest of
 * the codebase can keep working purely in terms of HTTP_PROXY / HTTPS_PROXY
 * (as required by spec) while every outbound call - including the ones
 * made internally by the instagram-url-direct package - actually goes
 * through the selected proxy.
 */

let bootstrapped = false;

export function ensureGlobalAgentBootstrapped(): void {
  if (bootstrapped) return;

  // global-agent needs this namespace set before bootstrap() is called.
  process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE = "GLOBAL_AGENT_";

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { bootstrap } = require("global-agent");
  bootstrap();

  bootstrapped = true;
}

export function syncProxyIntoGlobalAgent(): void {
  process.env.GLOBAL_AGENT_HTTP_PROXY = process.env.HTTP_PROXY || "";
  process.env.GLOBAL_AGENT_HTTPS_PROXY = process.env.HTTPS_PROXY || "";
  // Never let internal calls to our own API bypass the proxy accidentally.
  process.env.GLOBAL_AGENT_NO_PROXY = process.env.GLOBAL_AGENT_NO_PROXY || "";
}
