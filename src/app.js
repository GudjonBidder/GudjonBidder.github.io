console.log("Scripts LOADER ______ LOCALHOST");

const CHECKBOX_LABELS = {
  "subscription-important_features": "What is most important to you in a mobile subscription?",
  subscription_size: "Size of the subscription",
};
const subcriberType = {
  "Only for me": "individual",
  "For several/Family": "family",
};
const SUBSCRIBER_TYPE_KEY = "Subscription-are-for";
const NO_LABEL_FOUND = "__NO__LABEL__FOUND__";
const LEAD_FORM_SUBMIT_BUTTON_ID = "submit-first-form-btn";
const FIRST_NAME = "First-name";
const LAST_NAME = "Last-name";
const EMAIL = "Email";
const PHONE_NUMBER = "Phone-number";
const OPERATOR_PRICES = "operatorPrices";
const IGNORED_KEYS_ON_RESET = [FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, OPERATOR_PRICES];
const SEND_OFFERS_TO_MY_EMAIL = "Send offers to my email";
const CONTACT_BY_AN_ADVISER = "Contact by an adviser";
const LOADING_TEXT = "Laster inn ...";

const sv = (key, val) => sessionStorage.setItem(key, val);
const gv = (key) => sessionStorage.getItem(key);
const rmv = (key) => sessionStorage.removeItem(key);
const resetDb = () => {
  // remove all session storage values, except for names, email, phone
  Object.keys(sessionStorage).map((key) => {
    if (IGNORED_KEYS_ON_RESET.includes(key)) return;
    rmv(key);
  });
};

const formatNumber = (num) => {
  // Convert the number to a string
  let numStr = num.toString();

  // Check if the length is less than 2
  if (numStr.length < 2) {
    // Prepend '0' to the string
    numStr = "0" + numStr;
  }

  return numStr;
};

const getFormattedSizes = (sizes) => {
  let result = {};

  sizes.forEach((item) => {
    let [key, value] = item.split(":");
    let [start, end] = value.split("-").map(Number);
    let valAvg = Math.floor((start + end) / 2);

    if (!result[key]) {
      result[key] = [valAvg];
    } else {
      result[key] = [...result[key], valAvg];
    }
  });

  return result;
};

const getTotalFromSizes = (prices, sizes) => {
  let total = 0;
  Object.keys(sizes).map((key) => {
    sizes[key].map((item) => {
      let price = prices.find((x) => x.split("=")[0] === item.toString());
      total += parseInt(price ? price.split("=")[1] : 0);
    });
  });
  // average for all selected sizes
  return Math.floor(total / Object.keys(sizes).length);
};

$(function () {
  let $body = $("body");
  // TODO: on page load check if current input fields has saved values
  // if yes, then fetch those and set to fields

  // TODO: Implement form submission, on last step

  // TODO: change rating bar length based on price order

  // if first page, reset session storage
  if ($body.hasClass("body-calc-step1")) {
    resetDb();
  }

  // if last page, show offers
  if ($body.hasClass("body-calc-step4")) {
    const operatorPrices = JSON.parse(gv("operatorPrices"));
    operatorPrices.forEach((item, i) => {
      const $offer_card = $(`#${item.operatorName}`);

      if (i === 0) {
        // update best value badge
        $(".best_value-banner").appendTo($offer_card);
      }

      // fix css order
      $offer_card.css({ order: i + 1 });
      // update price
      $offer_card.find(".price_text-total").text(item.total + " nok");
      $offer_card.find(".average-price_text").text(Math.round(item.total / 24) + " nok/mo. for 24 mo");

      // update rating number
      const rating = 5 - i < 2 ? 2 : 5 - i;
      $offer_card.find(".rating_text").text(rating + "/5");
      // add color to rating dots
      if (rating >= 5) {
        $offer_card.find(".rating_icon svg path:lt(5)").attr("fill", "#F8B200");
      } else if (rating >= 4) {
        $offer_card.find(".rating_icon svg path:lt(4)").attr("fill", "#F8B200");
      } else if (rating >= 3) {
        $offer_card.find(".rating_icon svg path:lt(3)").attr("fill", "#7AC143");
      } else {
        $offer_card.find(".rating_icon svg path:lt(2)").attr("fill", "#A5BD9D");
      }
    });
  }

  function showErrorMessages($formChild) {
    $formChild.closest("form").siblings(".form-error-message").css({ display: "block" });
  }

  function hideErrorMessages($formChild) {
    $formChild.closest("form").siblings(".form-error-message").css({ display: "none" });
  }

  /**
   * -------------------------------------------------------------
   * Required field validation
   * on ".continue_button" link click, check if all required fields are filled
   * if not, then show error message, else continue to next page load
   */
  $(".continue_button").on("click", function (e) {
    e.preventDefault();
    let errors = false;
    const $el = $(this);
    const link = $el.attr("href");

    const uniqueInputs = $("input")
      .map(function () {
        return this.name;
      })
      .get();

    // Filter only the required inputs
    const requiredInputs = uniqueInputs.filter(function (name) {
      return $("[name='" + name + "'][required]").length > 0;
    });

    // unique values
    const uniqueRequiredInputs = [...new Set(requiredInputs)];

    uniqueRequiredInputs.forEach((name) => {
      const $input = $(`input[name='${name}']`);
      const $inputType = $input.attr("type");

      if ($inputType === "radio" && !$(`input[name='${name}']:checked`).val()) {
        errors = true;
        showErrorMessages($input);
      } else if ($inputType === "checkbox" && !$(`input[name='${name}']:checked`).val()) {
        errors = true;
        showErrorMessages($input);
      } else if (!$input.val()) {
        errors = true;
        showErrorMessages($input);
      }
    });

    // --------------------------------- for repeater size fields
    const $sizeFieldsWrap = $(".size-fields-wrapper");
    if ($sizeFieldsWrap.length) {
      // if at least one checkbox is not checked is not checked under each form,
      // then show error message
      const $sizeFields = $sizeFieldsWrap.find(".form-field-container");
      $sizeFields.each(function (index, el) {
        const $inputs = $(el).find("input");
        const $checkboxes = $inputs.filter((index, el) => $(el).attr("type") === "checkbox");
        const $checked = $checkboxes.filter((index, el) => $(el).is(":checked"));
        if (!$checked.length) {
          errors = true;
          showErrorMessages($inputs.first());
        }
      });
    }

    if (errors) return;

    // --------------------------------- for lead form submission
    if ($el.attr("id") === LEAD_FORM_SUBMIT_BUTTON_ID) {
      // --------------------------------- calculate price offer for each operator
      const operatorPrices = [];

      const userType = gv(SUBSCRIBER_TYPE_KEY);
      const rawPricesPerOperator = $(`[data-type='${subcriberType[userType]}']`);
      const sizes = getFormattedSizes(JSON.parse(gv(CHECKBOX_LABELS.subscription_size)));

      rawPricesPerOperator.each(function (index, el) {
        const $el = $(el);
        const operatorName = $el.attr("id");
        const prices = $el.text().split("\n");
        const total = getTotalFromSizes(prices, sizes);
        operatorPrices.push({
          operatorName,
          total,
        });
      });

      // sort by price
      operatorPrices.sort((a, b) => a.total - b.total);
      console.log(operatorPrices);
      // save to session storage
      sv("operatorPrices", JSON.stringify(operatorPrices));

      submitLeadForm();
      setTimeout(() => {
        window.location.href = link;
      }, 3000);
    } else window.location.href = link;
  });

  // ========================================== END Continue button click

  function saveInputValue(name, val) {
    sv(name, val);
  }

  function handleRadioButtonClick(e) {
    const $el = $(e.currentTarget);
    // ui state updates
    $el.addClass("is-active");
    $el.siblings().removeClass("is-active");

    // save value to session storage
    const $input = $el.find("input");
    saveInputValue($input.attr("name"), $input.val());
    hideErrorMessages($el);
  }

  // radio button field on click
  $(".service-form").on("click", ".radio_button, .radio_button-sm", handleRadioButtonClick);

  // checkbox field on click

  const handleCheckboxSelection = (e) => {
    const $el = $(e.currentTarget);

    // get key from parent based on CHECKBOX_LABELS
    const $parent = $el.parent();
    let label = NO_LABEL_FOUND;

    Object.keys(CHECKBOX_LABELS).map((key) => {
      if ($parent.hasClass(key)) {
        label = CHECKBOX_LABELS[key];
      }
    });

    const $input = $el.find("input[type='checkbox']");
    const oldValues = JSON.parse(gv(label));

    if ($input.is(":checked")) {
      hideErrorMessages($input);
      // save value to session storage
      if (!oldValues) {
        saveInputValue(label, JSON.stringify([$input.attr("data-name")]));
      } else {
        saveInputValue(label, JSON.stringify([...oldValues, $input.attr("data-name")]));
      }
    } else {
      // remove value from session storage
      const newValues = oldValues && oldValues.filter((val) => val !== $input.attr("data-name"));
      saveInputValue(label, JSON.stringify(newValues));
    }
  };

  $(".service-form").on("click", ".checkbox_button, .checkbox_accpetance", handleCheckboxSelection);

  // text inputs: Step 3
  $(".service-form input").on("input", function () {
    if ($(this).attr("type") === "checkbox") return;
    if ($(this).attr("type") === "radio") return;
    // save value to session storage
    hideErrorMessages($(this));
    saveInputValue($(this).attr("name"), $(this).val());
  });

  /**
   * -------------------------------------------------------------
   * Step 1 dynamic functions
   */
  $(".operator_company").on("click", handleRadioButtonClick);

  /**
   * -------------------------------------------------------------
   * Step 3 dynamic functions
   */
  const sizeFieldsWrap = $(".size-fields-wrapper");
  const defaultSizeField = $(".form-field-container[data-default]");
  let cloneCount = 1;

  /**
   * -------------------------------------------------------------
   * sizes field add or remove
   */
  // handle add new size field
  $(".add-more-size_btn").on("click", function () {
    // clone element
    const $clone = defaultSizeField.clone();

    $clone.addClass("border-top");
    $clone.find(".delete-size").first().removeClass("is-default");
    const serialNum = $clone.find(".calculator-sub-title_num").first();
    serialNum.text(formatNumber(cloneCount + 1));
    cloneCount += 1;

    // clear input values
    $clone.find("input").val("");
    $clone.find("input").prop("checked", false);
    $clone.find(".w-checkbox-input--inputType-custom").removeClass("w--redirected-checked");

    // update attributes of input fields
    const inputFields = $clone.find("input");
    inputFields.each(function (index, el) {
      // name, id, for
      const name = $(el).attr("name");
      const newName = name.replace(name.split("-")[0], cloneCount);
      $(el).attr("name", newName);
      $(el).attr("id", newName);
      $(el).siblings(".subs_checkbox-label").attr("for", newName);

      const dataName = $(el).attr("data-name");
      const newDataName = dataName.replace(dataName.split(":")[0], cloneCount);
      $(el).attr("data-name", newDataName);
    });
    hideErrorMessages(inputFields.first());

    // append to parent
    sizeFieldsWrap.append($clone);
  });
  // handle delete size field
  sizeFieldsWrap.on("click", ".delete-size", function () {
    // cleanup session storage
    const $el = $(this);
    const $inputs = $el.closest(".details_title-wrap").siblings(".form-block").find("input");
    const label = CHECKBOX_LABELS.subscription_size;
    const oldValues = JSON.parse(gv(label));
    const deletedValues = [];
    $inputs.each(function (index, el) {
      if ($(el).is(":checked")) {
        deletedValues.push($(el).attr("data-name"));
      }
    });
    const newValues = oldValues.filter((val) => !deletedValues.includes(val));
    saveInputValue(label, JSON.stringify(newValues));
    // remove element
    $(this).closest(".form-field-container").remove();
    // update serial numbers
    const serialNums = sizeFieldsWrap.find(".calculator-sub-title_num");
    serialNums.each(function (index, el) {
      $(el).text(formatNumber(index + 1));
    });
  });
  // ========================================== END STEP 3

  /**
   * handle final form submission
   */
  function submitLeadForm() {
    const $form = $("#lead-form");
    const values = sessionStorage;
    Object.keys(values).map((key) => {
      if (key === NO_LABEL_FOUND) return;
      if (Object.values(CHECKBOX_LABELS).includes(key)) {
        const arr = JSON.parse(values[key]);
        const forMattedArr = arr.map((val) => (val.includes(":") ? val + " GB" : val));
        $form.append(`<input type="hidden" name="${key}" data-name="${key}" value="${forMattedArr.join(",")}">`);
      } else $form.append(`<input type="hidden" name="${key}" data-name="${key}" value="${values[key]}">`);
    });

    // $(".loading_screen").removeClass("hide");
    $(".loading_screen").show(100);
    $(".loading-bar_line").animate(
      {
        width: "100%",
      },
      2900,
    );

    $form.submit();
    resetDb();
  }

  $(".offer_button-wrapper button").on("click", function (e) {
    e.preventDefault();
    const value = $(this).attr("value");
    $(this).text(LOADING_TEXT);
    // set values to hidden fields
    const $form = $(".bidder_calc_form");
    const name = gv(FIRST_NAME) + " " + gv(LAST_NAME);
    const email = gv(EMAIL);
    const phone = gv(PHONE_NUMBER);

    $form.append(`<input type="hidden" name="Name" data-name="Name" value="${name}">`);
    $form.append(`<input type="hidden" name="Email" data-name="Email" value="${email}">`);
    $form.append(`<input type="hidden" name="Phone" data-name="Phone" value="${phone}">`);

    if (value === "Send offers to my email") {
      $form.append(`<input type="hidden" name="${SEND_OFFERS_TO_MY_EMAIL}" data-name="${SEND_OFFERS_TO_MY_EMAIL}" value="true">`);
    } else {
      $form.append(`<input type="hidden" name="${CONTACT_BY_AN_ADVISER}" data-name="${CONTACT_BY_AN_ADVISER}" value="true">`);
    }

    // submit form
    $form.trigger("submit");
  });
});
