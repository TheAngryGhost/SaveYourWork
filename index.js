import createBareServer from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

import http from "node:http";
import serveStatic from "serve-static";
import connect from "connect";
import Buffy from "./buffy.js";
const proxy = new Buffy({
  url: "https://amethystnetwork-dev.github.io/Incognito/static",
  validateStatus: (status) => status !== 404
}); 
const gs = new Buffy({
  url: "https://amethystnetwork-dev.github.io/Incognito/gsource",
  validateStatus: (status) => status !== 404
}); 
const app = connect();
const bare = createBareServer("/bare/");
const server = http.createServer();

app.use((req, res, next) => {
  if(bare.shouldRoute(req)) bare.routeRequest(req, res); else next();
});

app.use("/service", (req, res) => res.end("OK"));
app.use("/source", (req, res, next) => gs.request(req, res, next));
app.use((req, res, next) => proxy.request(req, res, next));

app.use("/uv", serveStatic(uvPath));

server.on("request", app);

server.on("upgrade", (req, socket, head) => {
  if(bare.shouldRoute(req, socket, head)) bare.routeUpgrade(req, socket, head); else socket.end();
});

server.on("listening", () => {
  const addr = server.address();

  console.log(`Server running on port ${addr.port}`);
  console.log("");
  console.log("You can now view it in your browser.");
  /* Code for listing IPS from website-aio */
  console.log(`Local: http://${addr.family === "IPv6" ? `[${addr.address}]` : addr.address}:${addr.port}`);
  try { console.log(`On Your Network: http://${address.ip()}:${addr.port}`); } catch (err) {/* Can't find LAN interface */};
  if(process.env.REPL_SLUG && process.env.REPL_OWNER) console.log(`Replit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});

server.listen({ port: (process.env.PORT || 8080) })