const SVG_NS = "http://www.w3.org/2000/svg";

export function sampleMontgomeryBranches(a, { xMin = -4, xMax = 4, samples = 1600 } = {}) {
  const branches = [[], []];
  for (let index = 0; index <= samples; index += 1) {
    const x = xMin + ((xMax - xMin) * index) / samples;
    const value = x * x * x + a * x * x + x;
    if (value < 0) {
      branches[0].push(null);
      branches[1].push(null);
      continue;
    }
    const y = Math.sqrt(value);
    branches[0].push([x, y]);
    branches[1].push([x, -y]);
  }
  return branches;
}

export function createMontgomeryCurveSvg({ a = 0, width = 160, height = 104, stroke = "currentColor" } = {}) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = `width:${width}px;max-width:100%;height:auto;overflow:visible`;

  const scale = Math.min(width / 8, height / 6.2);
  const toScreen = ([x, y]) => [width / 2 + x * scale, height * 0.54 - y * scale];
  sampleMontgomeryBranches(a).forEach((branch) => {
    let pathData = "";
    let penDown = false;
    branch.forEach((point) => {
      if (!point) {
        penDown = false;
        return;
      }
      const [x, y] = toScreen(point);
      pathData += `${penDown ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)} `;
      penDown = true;
    });
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
  });
  return svg;
}
