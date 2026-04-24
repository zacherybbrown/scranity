let project = {};
let currentScript = null;

function createScript() {
  const name = prompt("Script name?");
  if (!name) return;

  project[name] = [];
  currentScript = name;
  refreshScripts();
  renderBlocks();
}

function refreshScripts() {
  const list = document.getElementById("scriptList");
  list.innerHTML = "";

  Object.keys(project).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (name === currentScript) option.selected = true;
    list.appendChild(option);
  });

  updateCodePreview();
}

function switchScript() {
  currentScript = document.getElementById("scriptList").value;
  renderBlocks();
}

function addBlock(type) {
  if (!currentScript) {
    alert("Create a script first.");
    return;
  }

  project[currentScript].push({ type });
  renderBlocks();
}

function renderBlocks() {
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  if (!currentScript) return;

  project[currentScript].forEach((block, i) => {
    const div = document.createElement("div");
    div.className = "block";
    div.textContent = `${i + 1}. ${block.type}`;
    editor.appendChild(div);
  });

  updateCodePreview();
}

function generateCode(name) {
  let code = `using UnityEngine;\n\npublic class ${name} : MonoBehaviour\n{\n`;

  const blocks = project[name] || [];

  blocks.forEach(block => {
    switch (block.type) {
      case "Start":
        code += "    void Start()\n    {\n    }\n\n";
        break;
      case "Update":
        code += "    void Update()\n    {\n    }\n\n";
        break;
      case "DebugLog":
        code += '    Debug.Log("Hello from Scranity!");\n';
        break;
      case "MoveForward":
        code += "    transform.Translate(Vector3.forward * Time.deltaTime);\n";
        break;
      case "If":
        code += "    if (true)\n    {\n    }\n";
        break;
    }
  });

  code += "}\n";
  return code;
}

function updateCodePreview() {
  const preview = document.getElementById("codePreview");
  if (!currentScript) {
    preview.textContent = "";
    return;
  }
  preview.textContent = generateCode(currentScript);
}

function exportProject() {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  download(blob, "scranity-project.json");
}

function exportCSharp() {
  if (!currentScript) return;
  const blob = new Blob([generateCode(currentScript)], { type: "text/plain" });
  download(blob, currentScript + ".cs");
}

function download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
