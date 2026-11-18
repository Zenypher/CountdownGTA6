class Logo extends HTMLElement {
  connectedCallback() {
    const requestedWidth = Number(this.getAttribute("width"));
    const width = Number.isFinite(requestedWidth) && requestedWidth > 0 ? requestedWidth : 980;
    const requestedHeight = Number(this.getAttribute("height"));
    const height = Number.isFinite(requestedHeight) && requestedHeight > 0
      ? requestedHeight : width * 743.98 / 980;
    const image = document.createElement("img");
    image.src = "/assets/gta-vi-logo.v1.svg";
    image.alt = ""; // The containing link supplies its accessible name.
    image.width = width;
    image.height = height;
    this.replaceChildren(image);
  }
}

customElements.define("web-logo", Logo);
