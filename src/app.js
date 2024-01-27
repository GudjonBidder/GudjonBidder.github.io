console.log("Scripts LOADER ______ LOCALHOST");

$(function () {
  // radio button field on click
  $(".radio-button_field").on("click", function () {
    $(this).addClass("active");
    $(this).siblings().removeClass("active");
  });
});
