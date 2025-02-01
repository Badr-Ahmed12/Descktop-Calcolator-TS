let output: HTMLElement | null = document.getElementById("output");
let history: HTMLElement | null = document.getElementById("history");
let currentInput: string = "";
let previousOperations: string[] = [];

// إضافة مدخلات للعرض
function appendCharacter(character: string): void {
  if (currentInput === "0" && character !== '.') {
    currentInput = character;
  } else {
    currentInput += character;
  }
  if (output) {
    output.innerText = currentInput;
  }
}

// مسح الإخراج
function clearOutput(): void {
  currentInput = "0";
  if (output) {
    output.innerText = currentInput;
  }
  previousOperations = [];
  updateHistory();
}

// حساب النتيجة
function calculate(): void {
  try {
    // إضافة العملية الحالية إلى سجل العمليات
    const result = eval(currentInput);
    previousOperations.push(`${currentInput} = ${result}`);
    
    // تحديث السجل
    updateHistory();
    
    // عرض النتيجة
    currentInput = result.toString();
    if (output) {
      output.innerText = currentInput;
    }
  } catch (error) {
    if (output) {
      output.innerText = "خطأ";
    }
    currentInput = "0";
  }
}

// تحديث سجل العمليات
function updateHistory(): void {
  if (history) {
    history.innerHTML = previousOperations.slice(-5).reverse().join('<br>');
  }
}

