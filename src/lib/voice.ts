/**
 * 將中文口語數字轉為阿拉伯數字字串
 * 例如: "一百點五" -> "100.5", "負二十五點二" -> "-25.2"
 */
export function parseSpokenNumber(text: string): string {
  let clean = text.trim();
  // 移除所有空白、句號與逗號
  clean = clean.replace(/[\s,，。]+/g, '');
  
  // 替換負號
  clean = clean.replace(/負/g, '-');
  
  // 處理小數點
  clean = clean.replace(/[點点]/g, '.');

  // 對於常見的口語中文數字做映射 (簡單位轉換)
  const charMap: { [key: string]: string } = {
    '零': '0', '一': '1', '二': '2', '兩': '2', '三': '3', 
    '四': '4', '五': '5', '六': '6', '七': '7', '八': '8', '九': '9'
  };

  // 如果字串中含有中文，嘗試轉換
  let hasChinese = false;
  let result = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (charMap[char] !== undefined) {
      result += charMap[char];
      hasChinese = true;
    } else if (char === '十' || char === '百' || char === '千') {
      hasChinese = true;
      result += char;
    } else {
      result += char;
    }
  }

  if (!hasChinese) {
    return clean;
  }

  // 處理中文的十、百、千
  return convertChineseNumeral(result);
}

function convertChineseNumeral(str: string): string {
  const isNegative = str.startsWith('-');
  const workingStr = isNegative ? str.slice(1) : str;

  // 切割小數點前後
  const parts = workingStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : '';

  // 解析整數部分
  let intVal = 0;
  let tempVal = 0;

  for (let i = 0; i < integerPart.length; i++) {
    const char = integerPart[i];
    if (char >= '0' && char <= '9') {
      tempVal = tempVal * 10 + parseInt(char, 10);
    } else if (char === '十') {
      if (tempVal === 0) tempVal = 1; // 十 -> 10, 十三 -> 13
      intVal += tempVal * 10;
      tempVal = 0;
    } else if (char === '百') {
      if (tempVal === 0) tempVal = 1;
      intVal += tempVal * 100;
      tempVal = 0;
    } else if (char === '千') {
      if (tempVal === 0) tempVal = 1;
      intVal += tempVal * 1000;
      tempVal = 0;
    }
  }
  intVal += tempVal;

  // 解析小數部分：中文小數通常是單個數字串接，例如 "點五二" -> ".52"
  let decStr = '';
  for (let char of decimalPart) {
    if (char >= '0' && char <= '9') {
      decStr += char;
    }
  }

  const finalVal = (isNegative ? '-' : '') + intVal + (decStr ? '.' + decStr : '');
  return isNaN(Number(finalVal)) ? str : finalVal;
}
