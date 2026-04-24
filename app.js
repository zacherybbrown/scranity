
let workspace;
let scripts = {};
let currentScript = null;

/* -------- BLOCK DEFINITIONS -------- */

Blockly.Blocks['unity_start'] = {
  init: function() {
    this.appendDummyInput().appendField("Start");
    this.appendStatementInput("BODY");
    this.setColour(35);
  }
};

Blockly.Blocks['unity_update'] = {
  init: function() {
    this.appendDummyInput().appendField("Update");
    this.appendStatementInput("BODY");
    this.setColour(35);
  }
};

Blockly.Blocks['unity_if'] = {
  init: function() {
    this.appendDummyInput().appendField("if true");
    this.appendStatementInput("BODY");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
  }
};

Blockly.Blocks['unity_debug_log'] = {
  init: function() {
    this.appendDummyInput().appendField("Debug Log");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};

Blockly.Blocks['unity_move_forward'] = {
  init: function() {
    this.appendDummyInput().appendField("Move Forward");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};

Blockly.Blocks['unity_rotate_y'] = {
  init: function() {
    this.appendDummyInput().appendField("Rotate Y");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
  }
};

/* -------- TRUE C# GENERATOR -------- */

function statementCode(block) {
  let code = "";
  let current = block;
  while (current) {
    switch(current.type) {
      case "unity_debug_log":
        code += '        Debug.Log("Hello from Scranity");\n';
        break;

      case "unity_move_forward":
        code += '        transform.Translate(Vector3.forward * Time.deltaTime * 5f);\n';
        break;

      case "unity_rotate_y":
        code += '        transform.Rotate(0f, 90f * Time.deltaTime, 0f);\n';
        break;

      case "unity_if":
        const inner = Blockly.selected ?
          "" : "";
        const child = current.getInputTargetBlock("BODY");
        code += "        if (true)\n        {\n";
        if (child) code += statementCode(child);
        code += "        }\n";
        break;
    }
    current = current.getNextBlock();
  }
  return code;
}

function generateCSharp(className) {
  let code = "using UnityEngine;\n\n";
  code += `public class ${className} : MonoBehaviour\n{\n`;

  const topBlocks = workspace.getTopBlocks(true);

  topBlocks.forEach(block => {
    if (block.type === "unity_start") {
      code += "    void Start()\n    {\n";
      const child = block.getInputTargetBlock("BODY");
      if (child) code += statementCode(child);
      code += "    }\n\n";
    }

    if (block.type === "unity_update") {
      code += "    void Update()\n    {\n";
      const child = block.getInputTargetBlock("BODY");
      if (child) code += statementCode(child);
      code += "    }\n\n";
    }
  });

  code += "}\n";
  return code;
}

/* -------- PROJECT SYSTEM -------- */

function setup() {
  workspace = Blockly.inject("blocklyDiv", {
    toolbox: document.getElementById("toolbox")
  });

  workspace.addChangeListener(updatePreview);
}

function newScript() {
  const name = prompt("Script Name?");
  if (!name) return;
  scripts[name] = "";
  currentScript = name;
  refreshScripts();
  workspace.clear();
  updatePreview();
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

function updatePreview() {
  if (!currentScript) {
    document.getElementById("preview").textContent = "";
    return;
  }
  document.getElementById("preview").textContent =
    generateCSharp(currentScript);
}

function exportCode() {
  if (!currentScript) return;
  const code = generateCSharp(currentScript);
  const blob = new Blob([code], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentScript + ".cs";
  a.click();
}

window.onload = setup;
