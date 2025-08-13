async function osuApiRequest({ url, headers, errorString, method, body, params }) {

  if (params) {
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: headers,
      ...(body && { body: body }),
    });

    if (!response.ok) {
      console.error(`HTTP error: ${response.status} - ${response.statusText}`);
      console.error(`${errorString} - response was not ok!`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `${errorString} - try failed in osu API request funtion!...:`,
      error,
    );
    return null;
  }
}

module.exports = osuApiRequest;
