console.log("Scripts LOADER ______ LOCALHOST");

const sv = (key, val) => sessionStorage.setItem(key, val);
const gv = (key) => sessionStorage.getItem(key);
const rmv = (key) => sessionStorage.removeItem(key);

$(function () {
  // TODO: on load check if current input fields has saved values
  // if yes, then fetch thsose and set to fields

  // radio button field on click
  $(".radio-button_field").on("click", function () {
    // ui state updates
    $(this).addClass("active");
    $(this).siblings().removeClass("active");

    // save value to session storage
    const $input = $(this).find("input");
    sv($input.attr("name"), $input.val());
  });
});
