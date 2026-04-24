
let workspace;
let scripts = {};
let currentScript = null;

function toolboxXml() {
  const toolbox = document.getElementById("toolbox");
  toolbox.innerHTML = "<category name='Unity'></category>";
  const cat = toolbox.querySelector("category");

  SCRANITY_UNITY_BLOCKS.forEach(block => {
    Blockly.Blocks[block.type] = {
      init: function () {
        this.appendDummyInput()
          .appendField(block.label);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230); // Scratch-like orange
      }
    };

    const xml = document.createElement("block");
    xml.setAttribute("type", block.type);
    cat.appendChild(xml);
  });

  workspace = Blockly.inject("blocklyDiv", {
    toolbox: toolbox
  });

  workspace.addChangeListener(updatePreview);
}

function newScript() {
  const name = prompt("Script name?");
  if (!name) return;
  scripts[name] = "";
  currentScript = name;
  refreshScripts();
}

function refreshScripts() {
  const list = document.getElementById("scriptList");
  list.innerHTML = "";
  Object.keys(scripts).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (name === currentScript) option.selected = true;
    list.appendChild(option);
  });
}

function switchScript() {
  if (currentScript) {
    scripts[currentScript] = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace)
    );
  }

  currentScript = document.getElementById("scriptList").value;
  workspace.clear();

  if (scripts[currentScript]) {
    const dom = Blockly.Xml.textToDom(scripts[currentScript]);
    Blockly.Xml.domToWorkspace(dom, workspace);
  }

  updatePreview();
}

function generateCode() {
  if (!currentScript) return "";
  let code = "using UnityEngine;\n\n";
  code += `public class ${currentScript} : MonoBehaviour\n{\n`;

  const blocks = workspace.getAllBlocks(false);
  blocks.forEach(b => {
    code += `    // ${b.type}\n`;
  });

  code += "}\n";
  return code;
}

function updatePreview() {
  document.getElementById("preview").textContent = generateCode();
}

function exportProject() {
  if (currentScript) {
    scripts[currentScript] = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace)
    );
  }

  const blob = new Blob([JSON.stringify(scripts, null, 2)], {type:"application/json"});
  download(blob, "scranity-project.json");
}

function exportCode() {
  const blob = new Blob([generateCode()], {type:"text/plain"});
  download(blob, (currentScript || "Script") + ".cs");
}

function loadExtension() {
  alert("Extension system scaffold ready: load custom block JSON + generators here.");
}

function download(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

window.onload = toolboxXml;
