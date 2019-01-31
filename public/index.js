var current = {
  x: 0,
  y: 0,
  zoom: 1
};
var con = document.getElementById('workspace');
con.addEventListener('wheel', zoom, {
  passive: false
});
con.addEventListener('mousedown', mouseDownNode, {
  passive: false
});
var childNo = 1;
var dragEntityStyle;
var isDrawingLine = false;
var srcEntity;
var svg;
var newPath;

var srcPoint = {
  x: 0,
  y: 0
};
var adjustSheet = false;
var clickedArea = {
  x: 0,
  y: 0
};
var isDraggingEntity = false;
var prevWidth = 0;

function zoom(e) {
  var delta = e.wheelDelta || -e.detail;
  this.scrollTop += (delta < 0 ? 1 : -1) * 30;
  e.preventDefault();

  var oz = current.zoom,
    nz = current.zoom * (delta < 0 ? 0.9 : 1.2);

  if (nz < 1 || nz > 15) {
    console.log('coef', nz);
    return;
  }
  /// calculate click at current zoom
  var ix = (e.layerX - current.x) / oz,
    iy = (e.layerY - current.y) / oz,
    /// calculate click at new zoom
    nx = ix * nz,
    ny = iy * nz,
    /// move to the difference
    /// make sure we take mouse pointer offset into account!
    cx = (ix + (e.layerX - ix) - nx),
    cy = (iy + (e.layerY - iy) - ny);

  // update current
  current.zoom = nz;
  current.x = cx;
  current.y = cy;
  console.log('rect client', current);
  /// make sure we scale before translate!
  con.style.transform = `translate(${cx}px, ${cy}px) scale(${nz})`;
};

function drag(ev) {
  ev.dataTransfer.setData('data', ev.target.id);
  if (ev.target.id === 'drag-entity') {

    dragEntityStyle = ev.target.cloneNode(true);
    dragEntityStyle.style.position = "absolute";
    dragEntityStyle.style.width = "10px";
    dragEntityStyle.style.height = "10px";
    dragEntityStyle.style.top = "-100px";
    dragEntityStyle.style.left = "-100px";
    dragEntityStyle.style.zIndex = -1;

    var inner = dragEntityStyle.getElementsByClassName("inner")[0];
    inner.style.position = "absolute";
    inner.style.width = "100px";
    inner.style.height = "50px";
    inner.style.top = "0px";
    inner.style.left = "0px";
    inner.style.backgroundColor = "orange";
    inner.style.transform = `scale(${current.zoom})`;

    document.body.appendChild(dragEntityStyle);
    ev.dataTransfer.setDragImage(dragEntityStyle, 20, 20);
    console.log('drag ev, entity', ev);
  } else if (ev.target.id === 'drag-condition') {
    console.log('drag ev, cond', ev);
    var cond = document.getElementById('condition-shadow');
    document.body.appendChild(cond);
    ev.dataTransfer.setDragImage(cond, 20, 20);
    ev.dataTransfer.dropEffect = "copy";
  }
}

function dragOver(e) {
  dragEntityStyle.remove();
}

function drop(ev) {
  ev.preventDefault();
  console.log('drop', ev);
  var wrapper = document.createElement('div');
  wrapper.id = "en-" + childNo;
  wrapper.addEventListener("mousedown", mouseDownNode, true);
  wrapper.addEventListener("click", openDetail, true);
  wrapper.style.position = "absolute";
  wrapper.style.transform =
    `translate(${(ev.layerX - (current.x+20)) / current.zoom}px, ${(ev.layerY - (current.y+20)) / current.zoom}px)`;
  wrapper.style.border = "#faebd7";
  wrapper.style.boxShadow = '2px 2px 4px #393939';
  var elem = document.createElement('div');
  elem.style.position = "relative";
  elem.style.width = "100px";
  elem.style.height = "50px";
  elem.style.background = "#faffb0";
  elem.style.color = "black";
  elem.style.display = 'flex';
  elem.style.alignItems = 'center';
  elem.style.justifyContent = 'center';
  var node = document.createElement('div');
  node.addEventListener("mousedown", mouseDownNode, true);
  node.addEventListener("mouseenter", mouseEnterNode, true);
  node.addEventListener("mouseleave", mouseLeaveNode, true);
  node.style.position = "absolute";
  node.style.right = "-5px";
  node.style.top = "20px";
  node.style.borderRadius = "50%";
  node.style.width = "10px";
  node.style.height = "10px";
  node.style.background = "blue";
  node.style.zIndex = "-1";
  elem.innerHTML = 'Entity';
  if (ev.dataTransfer.getData('data') === 'drag-condition') {
    wrapper.style.transform = `translate(${ev.layerX}px, ${ev.layerY}px) rotate(45deg)`;
    elem.style.width = "75px";
    elem.style.height = "75px";
    node.style.right = "70px";
    node.style.top = "-5px";
    elem.innerHTML = null;
    var condition = document.createElement('div');
    condition.innerHTML = 'Condition';
    condition.style.transform = 'rotate(-45deg)';
    elem.appendChild(condition);
  }
  elem.appendChild(node);
  wrapper.appendChild(elem);
  ev.target.appendChild(wrapper);
  childNo++;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function mouseEnterNode(ev) {
  ev.preventDefault();
  ev.target.style.transform = 'scale(2)';
}

function mouseLeaveNode(ev) {
  ev.preventDefault();
  ev.target.style.transform = 'scale(1)';
}

function mouseDownNode(ev) {
  ev.preventDefault();
  if (ev.target.id === 'workspace') {
    adjustSheet = true;
    clickedArea.x = event.layerX;
    clickedArea.y = event.layerY;
    ev.target.style.transition = 'none';
    ev.target.style.transitionTimingFunction = 'unset';
    console.log('ev', event.target.style);
    return;
  }
  if (event.target.parentElement.id === 'en-1') {
    srcPoint.x = event.x;
    srcPoint.y = event.y;
    isDraggingEntity = true;
    srcEntity = event.target;
    var nodeSvg = document.getElementById('e1-n1-svg');
    prevWidth = nodeSvg ? nodeSvg.getAttribute('width') : 10;
    console.log('entity drag', ev);
    return;
  }
  srcPoint.x = event.x;
  srcPoint.y = event.y;
  isDrawingLine = true;
  isDraggingEntity = false;
  srcEntity = event.target;
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('id', 'e1-n1-svg');
  svg.setAttribute('style', 'position: absolute; z-index: -2; top: calc(50% - 5px); left: 100%');
  svg.setAttribute('width', '10');
  svg.setAttribute('height', '10');
  newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  newPath.setAttribute("id", "e1-n1-path1");
  newPath.setAttribute("stroke-width", 2);
  newPath.setAttribute("opacity", 1);
  newPath.setAttribute("fill", "none");
  console.log('node', ev);
}

function trackMouse(ev) {
  ev.preventDefault();
  if (isDrawingLine) {
    console.log('tracking mouse', ev);
    var displaceX = (event.x - srcPoint.x) / current.zoom;
    svg.setAttribute('width', displaceX >= 0 ? displaceX : 0);
    newPath.setAttribute("stroke", "orangered");
    newPath.setAttribute("stroke-dasharray", "5,5");
    newPath.setAttribute("d", `M 0 5 l ${displaceX >= 0 ? displaceX: 0 } 0`);
    svg.appendChild(newPath);
    srcEntity.parentElement.appendChild(svg);
  } else if (isDraggingEntity) {
    var prevSVG = document.getElementById('e1-n1-svg');
    if (prevSVG) {
      var oldPath = document.getElementById('e1-n1-path1');
      var displaceX = prevWidth - (event.x - srcPoint.x);
      prevSVG.setAttribute('width', displaceX >= 0 ? displaceX : 0);
      oldPath.setAttribute("stroke", "orangered");
      oldPath.setAttribute("stroke-dasharray", "5,5");
      oldPath.setAttribute("d", `M 0 5 l ${displaceX >= 0 ? displaceX: 0 } 0`);
    }
    srcEntity.parentElement.style.transform = `translate(${ev.layerX}px, ${ev.layerY}px)`;
  } else if (adjustSheet) {
    current.x = current.x - (clickedArea.x - event.layerX);
    current.y = current.y - (clickedArea.y - event.layerY);
    clickedArea.x = event.layerX;
    clickedArea.y = event.layerY;
    ev.target.style.transform =
      `translate(${current.x}px, ${current.y}px)`;
  }
}

function stopTracking(ev) {
  ev.preventDefault();
  if (isDrawingLine) {
    console.log('tracking stop', ev);
    var displaceX = event.x - srcPoint.x;
    newPath.removeAttribute("stroke-dasharray", true);
    newPath.setAttribute("stroke", "orangered");
    newPath.setAttribute("d", `M 0 5 l ${displaceX >= 0 ? displaceX: 0 } 0`);
    isDrawingLine = false;
    svg = null;
    newPath = null;
    srcEntity = null;
  } else if (isDraggingEntity) {
    isDraggingEntity = false;
    console.log('tracking mouse stop', ev);
    var prevSVG = document.getElementById('e1-n1-svg');
    if (prevSVG) {
      var oldPath = document.getElementById('e1-n1-path1');
      var displaceX = prevWidth - (event.x - srcPoint.x);
      prevSVG.setAttribute('width', displaceX >= 0 ? displaceX : 0);
      oldPath.removeAttribute("stroke-dasharray", true);
      oldPath.setAttribute("stroke", "orangered");
      oldPath.setAttribute("d", `M 0 5 l ${displaceX >= 0 ? displaceX: 0 } 0`);
      prevWidth = 0;
    }
    srcEntity.parentElement.style.transform = `translate(${ev.layerX}px, ${ev.layerY}px)`;
    srcEntity = null;
  } else if (adjustSheet) {
    adjustSheet = false;
    ev.target.style.transition = 'transform 0.3s';
    ev.target.style.transitionTimingFunction = 'ease-in-out';
  }
}

function ce(name, attributes, parent) {
  const isNS = typeof (name) === 'string';
  const elem = isNS ? document.createElement(type) : document.createElementNS(Object.values(name)[0], Object.values(
    name)[1]);
  for (const attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      elem.setAttribute(attr, attributes[attr])
    }
  }
  if (parent) {
    parent.appendChild(elem);
  }
  return elem;
}

function openDetail(event) {
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
  var header = document.getElementById("modal-header");
  header.innerHTML = event.target.innerText;
  var editor = window.ace.edit("editor");
  editor.setOptions({
    enableBasicAutocompletion: true, // the editor completes the statement when you hit Ctrl + Space
    enableLiveAutocompletion: true, // the editor completes the statement while you are typing
    showPrintMargin: false, // hides the vertical limiting strip
    maxLines: Infinity,
    fontSize: "100%" // ensures that the editor fits in the environment
  });
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
}

var closeModal = document.getElementsByClassName("close")[0];
closeModal.onclick = function() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
}