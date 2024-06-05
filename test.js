function splitLongString(str) {
    const maxLength = 280;
    const delimiter = '\n\n';
    const parts = [];
  
    let currentPart = '';
  
    const chunks = str.split(delimiter);
  
    for (const chunk of chunks) {
      // Если добавление текущего куска превысит максимальную длину
      if (currentPart.length + chunk.length > maxLength) {
        // Добавляем текущую часть в результирующий массив
        parts.push(currentPart.trim());
        // Начинаем новую часть с текущего куска
        currentPart = chunk;
      } else {
        // Присоединяем текущий кусок к текущей части
        currentPart += delimiter + chunk;
      }
    }
  
    // Добавляем оставшуюся часть в результирующий массив
    if (currentPart.trim().length > 0) {
      parts.push(currentPart.trim());
    }
  
    return parts;
  }

  const longString = 'Это очень длинная строка, которая содержит более 280 символов.\n\nЭта строка будет разделена на части максимально близкие к 280 символам.\n\nКаждая часть не должна превышать 280 символов в длину, но должна быть максимально близка к этому значению.';

  const parts = splitLongString(longString);
  
  console.log(parts);