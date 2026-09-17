const iconClass = "bytm-playlist-search-icon";

/** Replace the cloned native icon with a playlist + search glyph. */
export function setPlaylistSearchIcon(menuItem: HTMLElement) {
  const root = menuItem.shadowRoot ?? menuItem;
  const nativeIcon = root.querySelector("yt-icon, iron-icon, tp-yt-iron-icon");
  const existingIcon = root.querySelector(`.${iconClass}`);
  if (existingIcon) {
    // Polymer may stamp its native icon again after a data update.
    if (nativeIcon) nativeIcon.replaceWith(existingIcon);
    return;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  // Retain the native icon's spacing and theme classes, not its Polymer bindings.
  svg.setAttribute("class", `${nativeIcon?.getAttribute("class") ?? "icon"} ${iconClass}`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.style.flexShrink = "0";
  svg.style.pointerEvents = "none";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M3 5h14M3 10h8M3 15h5M19 18l3 3");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "15.5");
  circle.setAttribute("cy", "14.5");
  circle.setAttribute("r", "4.5");
  svg.append(path, circle);

  if (nativeIcon) {
    nativeIcon.replaceWith(svg);
  } else {
    svg.style.marginInlineEnd = "16px";
    root.prepend(svg);
  }
}
