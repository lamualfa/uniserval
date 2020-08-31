// Check if script rendered in Server Side
if (Object.prototype.hasOwnProperty.call(window, 'serverProps')) {
  // Setting page title based `pageTitle` data which is passed via `renderToString` function
  document.title = window.serverProps.pageTitle

  const h1 = document.createElement('h1')
  h1.textContent = `Current page: ${window.serverProps.pageTitle}`
}

const paragraph = document.createElement('p')
paragraph.textContent =
  '  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod tempore cum est doloribus repudiandae ipsam laudantium rerum velit nostrum vel.'

document.body.appendChild(paragraph)
