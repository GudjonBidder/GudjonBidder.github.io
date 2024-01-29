console.log("Scripts LOADER ______ LOCALHOST");

const sv = (key, val) => sessionStorage.setItem(key, val);
const gv = (key) => sessionStorage.getItem(key);
const rmv = (key) => sessionStorage.removeItem(key);

$(function () {
  // TODO: on load check if current input fields has saved values
  // if yes, then fetch thsose and set to fields

  function saveInputValue($el) {
    const $input = $el.find("input");
    sv($input.attr("name"), $input.val());
  }

  function handleButtonClick(e) {
    // ui state updates
    $(e.currentTarget).addClass("is-active");
    $(e.currentTarget).siblings().removeClass("is-active");

    // save value to session storage
    saveInputValue($(this));
  }

  // radio button field on click
  $(".radio_button, .radio_button-sm").on("click", handleButtonClick);

  // operator selection
  $(".operator_company").on("click", handleButtonClick);
});
