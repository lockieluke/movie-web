export function openEmbeddedDevtools() {
  const script = document.createElement("script");
  script.src = "//chii.liriliri.io/target.js";
  script.setAttribute("embedded", "true");
  document.body.appendChild(script);
}
