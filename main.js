const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//Doi tuong
function validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
        return element;
    }

    var selectorRules = {};
    //Ham thuc hien validate
    const validate = function (element, rule) {
        const errorElement = getParent(
            element,
            options.formGroupSelector
        ).querySelector(options.errorMessage);
        var errorMessage;
        //lay ra cac rule cua selector
        var rules = selectorRules[rule.selector];
        //lap qua tung  rule & kiem tra
        //neu co loi thi dung viec kiem tra
        for (var i = 0; i < rules.length; ++i) {
            switch (element.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;

                default:
                    errorMessage = rules[i](element.value);
            }
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(element, options.formGroupSelector).classList.add(
                "invalid"
            );
        } else {
            errorElement.textContent = "";
            getParent(element, options.formGroupSelector).classList.remove(
                "invalid"
            );
        }
        return !errorMessage;
    };
    var formElement = $(options.form);

    if (formElement) {
        //Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;
            var enableInput = formElement.querySelectorAll("[name]");

            options.rules.forEach((rule) => {
                var inputElement = $(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                //submit bang js
                if (typeof options.onSubmit === "function") {
                    var formValue = Array.from(enableInput).reduce(function (
                        values,
                        input
                    ) {
                        switch (input.type) {
                            case "radio":
                                values[input.name] = formElement.querySelector(
                                    'input[name="' + input.name + '"]:checked'
                                ).value;
                                break;

                            case "checkbox":
                                if (input.matches(":checked")) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                } else {
                                    values[input.name] = "";
                                }
                                break;
                            case "file":
                                values[input.name] = input.file;

                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    },
                    {});

                    options.onSubmit(formValue);
                }
                //submit mac dinh khi khong co ham onsubmit
                else {
                    formElement.submit();
                }
            }
        };
        options.rules.forEach((rule) => {
            //luu lai cac rule cua input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = $$(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                //xu ly truong hop blur ra khoi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };
                //xu ly moi khi nguoi dung nhap
                inputElement.oninput = function () {
                    var errorElement = getParent(
                        inputElement,
                        options.formGroupSelector
                    ).querySelector(options.errorMessage);
                    errorElement.innerText = "";
                    getParent(
                        inputElement,
                        options.formGroupSelector
                    ).classList.remove("invalid");
                };
            });
        });
    }
}

//Dinh nghia rules
//nguyen tac cua cac rules:
/*
1.Khi co loi => tra ra message loi 
2.Khi hop le => Khong tra ra cai gi (undefined)
*/
validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Vui lòng nhập trường này ";
        },
    };
};
validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(value)
                ? undefined
                : message || "Trường này phải là Email";
        },
    };
};
validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Vui lòng nhập tối thiểu  ${min} ký tự.`;
        },
    };
};

validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return getConfirmValue() === value
                ? undefined
                : message || "vui lòng nhập lại đúng mật khẩu.";
        },
    };
};
// inputValue === value
//                 ? undefined
//                 : "Vui lòng nhập lại đúng mật khẩu ";
