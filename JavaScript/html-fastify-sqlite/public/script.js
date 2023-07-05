// Functions
  function replaceState(state){
    // Current view state
    window.history.replaceState({}, "", `/${state}`);
  };
  function activeTopNav(id){
    // Active top nav
    let topnav = document.getElementById(id);
    topnav != null && topnav != undefined
      ? topnav.setAttribute("class", "active")
      : {};
  };
  function togglePassword(eye, element){
    let toogle_type = element.getAttribute("type") == "password"
      ? "text" 
      : "password";
    element.setAttribute("type", toogle_type);
    // Toggle the eye slash icon
    eye.classList.toggle("fa-eye-slash");
  };
  function addDays(date, days) {
    var result = new Date(date);
    days = parseInt(days);
    result.setDate(result.getDate() + days);
    // Return date + days
    return result;
  };
  function parseDate(date) {
    let day = date.getDate().toString().padStart(2, "0");
    let mon = (date.getMonth() + 1).toString().padStart(2, "0");
    // Parse date to string dd/mm/yyyy
    return `${day}/${mon}/${date.getFullYear()}`;
  };
  function getSelectText(select){
    // return text from selected option
    return select.options[select.selectedIndex].text;
  };
  function getSelectAttribute(select, attribute){
    // return attribute from selected option
    return select.options[select.selectedIndex].getAttribute(attribute);
  };
  function setElementAttribute(element, attribute, value){
    // Change an attribute from current element
    return element.setAttribute(attribute, value);
  };
  function changeElementValue(value, element){
    // Change pair select
    return element.value = value;
  };
  function changeElementInnerHTML(value, element){
    // Change text value displayed
    return element.innerHTML = value;
  };
  async function validateImage(link){
    try {
      let options = {
        method: 'POST',
        headers: {},
        body: JSON.stringify({ link: link })
      }
      let data = await fetch(`https://${window.location.hostname}/validate/image`, options);
      let json = await data.json();
      return json.link;
    } catch(e) {
      console.log(`Validate image resulted in Error: ${e}`);
    }
  };
  async function changeCreateRentValue(select, src, label){
    let book        = getSelectText(select);
    let image       = getSelectAttribute(select, "image");
    let description = getSelectAttribute(select, "description");
    // Change description
    changeElementInnerHTML(description, label);
    // Change image url, validate if current url is valide, else process.env.IMAGE_UNAVAILABLE
    setElementAttribute( src, "src", await validateImage(image) );
    return;
  };
  function confirmRentCreation(book_name, days){
    let date = addDays(new Date(), days);
    let confirm = window.confirm(`Irei devolver o livro "${book_name}" até ${parseDate(date)} !`);
    return confirm;
  };
  function confirmRentDeletion(book_name){
    let confirm = window.confirm(`Está pronto para devolver o livro "${book_name}"?`);
    return confirm;
  };
  function showActionDiv(div_id){
    // Get div from action
    let div = document.getElementById(div_id);
    // Show the div
    return div.style.display = "block";
  };
  function hideActionDiv(div_id){
    // Get div from action
    let div = document.getElementById(div_id);
    // Hide the div
    return div.style.display = "none";
  };
  async function getRandomISBN10(){
    try {
      let options = {
        method: 'GET',
        headers: { }
      }
      let data = await fetch(`https://${window.location.hostname}/random/isbn10`, options);
      let json = await data.json();
      return json.isbn10;
    } catch(e) {
      console.log(`Random ISBN resulted in Error: ${e}`);
    }
  };
  async function changeCreateBookISBN(input){
    try {
      let isbn = await getRandomISBN10();
      return changeElementValue(isbn, input);
    } catch(e) {
      console.log(`changeCreateBookISBN resulted in Error: ${e}`);
    }
  };
  function confirmBookCreation(){
    let confirm = window.confirm("Está correto das informações inseridas ?");
    return confirm;
  };
  function confirmBookUpdate(){
    let confirm = window.confirm("Está correto das informações modificadas ?");
    return confirm;
  };
  function changeUpdateBookValues(select, form){
    form.querySelector("#isbn").value                   = getSelectAttribute(select, "isbn");
    form.querySelector("#update_book_input_name").value = getSelectAttribute(select, "value");
    form.querySelector("#author").value                 = getSelectAttribute(select, "author");
    form.querySelector("#pages").value                  = getSelectAttribute(select, "pages");
    form.querySelector("#quantity").value               = getSelectAttribute(select, "quantity");
    form.querySelector("#image").value                  = getSelectAttribute(select, "image");
    form.querySelector("#description").value            = getSelectAttribute(select, "description");
    return;
  };
  function toogleUpdateBookEditName(input, select){
    if( select.style.display == "none" && input.style.display == "inline" ){
      select.style.display = "inline";
      select.disabled      = false;
      input.style.display  = "none";
      input.disabled       = true;
      return;
    } else {
      select.style.display = "none";
      select.disabled      = true;
      input.style.display  = "inline";
      input.disabled       = false;
      return;
    }
  };
  function confirmBookDeletion(book_name){
    let confirm = window.confirm(`Tem certeza que deseja apagar o livro "${book_name}" do banco de dados ?`);
    return confirm;
  };
  function confirmUpdatePassword(user){
    let confirm = window.confirm(`Tem certeza que deseja alterar a senha do usuário "${user}" ?`);
    return confirm;
  };
  function confirmDeleteRegistration(user){
    let confirm = window.confirm(`Tem certeza que deseja remover o usuário "${user}" do banco de dados ?`);
    return confirm;
  };

// After page load
window.onload = function() {
  const state = document.getElementById("current_state").getAttribute('state_name');
  
  // Change state
    replaceState(state);
  
  // Change active top nav
    activeTopNav(`topnav_${state}`);
  
  // Events listener
    // Toogle password listener
      var eye_listener = document.getElementById("eye");
      eye_listener != null && eye_listener != undefined
        ? eye_listener.onclick = function(){
            let password = document.getElementById("password");
            togglePassword(this, password); 
            return;
          }
        : {};
    // Create rent listener
      var create_rent_listener = document.getElementById("form_create_rent");
      if(create_rent_listener != null && create_rent_listener != undefined){
        // Confirmation
          create_rent_listener.onsubmit = function(){ 
            let select = this.childNodes[0].parentNode[1];
            return confirmRentCreation( getSelectText(select), this.childNodes[0].parentNode[0].value ); 
          }
        // On select name change
          var create_rent_select_book = document.getElementById("create_rent_select_book");
          var create_rent_image       = document.getElementById("create_rent_image");
          var create_rent_description = document.getElementById("create_rent_description");
          create_rent_select_book.onchange = function(){
            changeCreateRentValue( this, create_rent_image, create_rent_description );
          }
        // On load
          changeCreateRentValue( create_rent_select_book, create_rent_image, create_rent_description )
      };
    // Delete rent listener
      var delete_rent_listener = document.getElementById("form_delete_rent");
      delete_rent_listener != null && delete_rent_listener != undefined
        ? delete_rent_listener.onsubmit = function(){ return confirmRentDeletion(this.childNodes[0].parentNode[0].getAttribute("book_name")); }
        : {};
    // Admin action listener
      var admin_action_listener = document.getElementById("admin_action");
      if( admin_action_listener != null && admin_action_listener != undefined ){
        // On page load, show first action
          showActionDiv(admin_action_listener.value);
          var previous_action = admin_action_listener.value;
        // Change of <select> value
          admin_action_listener.onchange = function(){
            // Hide previous action
            hideActionDiv(previous_action);
            // Show current action
            showActionDiv(this.value)
            // Current Action = next previous_action
            previous_action = this.value;
            return; 
          }
      };
    // Create book listener
      var create_book_listener = document.getElementById("create_book");
        if(create_book_listener != null && create_book_listener != undefined){
          // Create confirmation
            create_book_listener.onsubmit = function(){ return confirmBookCreation(); }
          // Random isbn
              var create_book_isbn_generator = document.getElementById("create_book_isbn_generator");
              var create_book_input_isbn     = document.getElementById("create_book_input_isbn");
              create_book_isbn_generator.onclick = function(){
                changeCreateBookISBN(create_book_input_isbn);
              }
        };  
    // Update book listener
      var update_book_listener = document.getElementById("update_book");
      if(update_book_listener != null && update_book_listener != undefined){
        // Select name change
          // On load
            var update_book_select_name = document.getElementById("update_book_select_name");
            changeUpdateBookValues(update_book_select_name, update_book_listener);
          // On change
            update_book_select_name.onchange = function(){ 
              changeUpdateBookValues(update_book_select_name, update_book_listener);
            }
        // Edit name icon
          var update_book_edit_icon  = document.getElementById("update_book_edit_icon");
          var update_book_input_name = document.getElementById("update_book_input_name");
          update_book_edit_icon.onclick = function(){ 
            toogleUpdateBookEditName(update_book_input_name, update_book_select_name)
          }
        // Confirm message
          update_book_listener.onsubmit = function(){ return confirmBookUpdate(); }
      };
    // Delete book listener
      var delete_book_listener = document.getElementById("delete_book");
      if(delete_book_listener != null && delete_book_listener != undefined){
        // Select isbn change
          var delete_book_select_isbn = document.getElementById("delete_book_select_isbn");
          delete_book_select_isbn.onchange = function(){ 
            // Change select_name to this.isbn
            changeElementValue( getSelectAttribute(this, "name"), delete_book_select_name ); 
          }
        // Select name change
          var delete_book_select_name = document.getElementById("delete_book_select_name");
          delete_book_select_name.onchange = function(){ 
            // Change select_isbn to this.name
            changeElementValue( getSelectAttribute(this, "isbn"), delete_book_select_isbn );
          }
        // Delete confirmation
          delete_book_listener.onsubmit = function(){ 
            return confirmBookDeletion( getSelectText(delete_book_select_name) );
          }
      };
    // Update password listener
      var update_password_listener = document.getElementById("update_password");
      if(update_password_listener != null && update_password_listener != undefined){
        // Select user change
          var update_password_select_user = document.getElementById("update_password_select_user");
          var update_password_input_id    = document.getElementById("update_password_input_id");
          update_password_select_user.onchange = function(){ 
            let user_id = getSelectAttribute(update_password_select_user, "user_id");
            changeElementValue(user_id, update_password_input_id);
          }
        // On load, add value to id
          let user_id = getSelectAttribute(update_password_select_user, "user_id");
          changeElementValue(user_id, update_password_input_id);
        // Toogle eye password
          var eye_listener = document.getElementById("update_password_eye");
          eye_listener.onclick = function(){ 
            let password = document.getElementById("update_password_input_password");
            togglePassword(this, password); 
            return;
          };
        // Update confirmation
          update_password_listener.onsubmit = function(){ 
            return confirmUpdatePassword( getSelectText(update_password_select_user) );
          }
      };
    // Delete registration listener
      var delete_registration_listener = document.getElementById("delete_registration");
      if(delete_registration_listener != null && delete_registration_listener != undefined){
        // Select name change
          var delete_registration_select_user = document.getElementById("delete_registration_select_user");
          var delete_registration_input_id    = document.getElementById("delete_registration_input_id");
          delete_registration_select_user.onchange = function(){ 
            let user_id = getSelectAttribute(delete_registration_select_user, "user_id");
            changeElementValue(user_id, delete_registration_input_id);
          }
        // On load, add value to id
          let user_id = getSelectAttribute(delete_registration_select_user, "user_id");
          changeElementValue(user_id, delete_registration_input_id);
        // Delete confirmation
          delete_registration_listener.onsubmit = function(){ 
            return confirmDeleteRegistration( getSelectText(delete_registration_select_user) );
          }
      };
  
}