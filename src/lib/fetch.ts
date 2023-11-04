/**
 * Fetch a url and read the result line by line.
 *
 * @param url URL of the resource.
 *
 * @example
 *   for await (const line of fetchLines(url)) {
 *     // process line
 *   }
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#processing_a_text_file_line_by_line
 */
export async function* fetchLines(url: string) {
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(url);

  if (!response.body) {
    throw new Error('Empty response body');
  }

  const reader = response.body.getReader();
  let { value, done } = await reader.read();
  let chunk = value ? utf8Decoder.decode(value) : '';

  const newline = /\r?\n/gmu;
  let startIndex = 0;

  while (true) {
    const result = newline.exec(chunk);

    if (result) {
      yield chunk.substring(startIndex, result.index);
      startIndex = newline.lastIndex;
      continue;
    }

    if (done) {
      break;
    }

    const remainder = chunk.substring(startIndex);
    ({ value, done } = await reader.read());
    chunk = remainder + (value ? utf8Decoder.decode(value) : '');
    startIndex = 0;
    newline.lastIndex = 0;
  }

  if (startIndex < chunk.length) {
    // Last line didn't end in a newline char
    yield chunk.substring(startIndex);
  }
}
