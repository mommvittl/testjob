var levelPlaceholderStr = {1: "Выберите регион...", 2: "Выберите город или район...", 3: "Выберите населенный пункт...", 4: "Выберите поселок...", }

setRegion();

$("#region").chosen().change(function () {
    if (this.value) {
        removeStr(this);
    }
});

$("#name, #email ").on("focus ", focusInput);
$("#name, #email ").on("blur ", blurInput);

//========================================================================
function focusInput() {
    $(this).nextAll('*').remove();
    $(this).removeClass('errValue');
}

function blurInput() {
    var resultValidate = validateElement(this);
    if (resultValidate && $(this).attr('name') == 'email') {
        $.getJSON("server.php?email=" + $(this).val(), function (data, textStatus, jqXHR) {
            if (data) {
                viewUser(data);
            }
        });
    }
}

function viewUser(data) {

    $("#reestation").empty();
    $("#reestation").append($("<h2>Личный кабинет</h2>"));
    var name = data.name;
    var email = data.email;
    var territory = data.ter_address;
    $("#reestation").append($("<p>" + name + "<p>")).addClass("user");
    $("#reestation").append($("<p>" + email + "<p>")).addClass("user");
    $("#reestation").append($("<p>" + territory + "<p>")).addClass("user");

}

function validateElement(element) {
    $(element).nextAll('*').remove();
    $(element).removeClass('errValue');
    var fieldValueLen = {'name': 5, 'email': 6};
    var fieldRegExp = {'name': /^[a-zA-Zа-яА-Я \\.]+$/, 'email': /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/};
    var value = $(element).val();
    var fieldName = $(element).attr('name');
    if ($(element).val().length < fieldValueLen[ fieldName ]) {
        $(element).addClass('errValue');
        $(element).parent().append($("<p></p>", {text: "недостаточная длинна данных", class: 'errString'}));
        return false;
    }
    if (!fieldRegExp[ fieldName ].test(value)) {
        $(element).addClass('errValue');
        $(element).parent().append($("<p></p>", {text: "некорректные данные", class: 'errString'}));
        return false;
    }
    return true;
}

function removeStr(element) {
    $(element).parent().nextAll('*').remove();
    createLevel(element.value, $(element).attr("data-level"));
}

function setRegion() {
    $.getJSON("server.php?territory=NULL", function (data, textStatus, jqXHR) {
        if (data && data.length) {
            for (var i = 0; i < data.length; i++) {
                $('#region').append($("<option></option>", {value: data[i].ter_id, text: data[i].ter_name}));
            }
            $("#region").trigger("chosen:updated");
        }
    });
}

function createLevel(region, level) {
    var newLevel = ++level;
    var newid = "level" + newLevel;
    $.getJSON("server.php?territory=" + region, function (data, textStatus, jqXHR) {
        if (data && data.length) {
            var stringForSelect = $("<p></p>", {id: newid});
            $("#reestrForm").append(stringForSelect);
            var select = $("<select></select>", {class: 'chosen-select widthParam', tabindex: "2", "data-placeholder": levelPlaceholderStr[ newLevel ], "data-level": newLevel});
            $(stringForSelect).append(select);
            $(select).append(" <option value=''></option>");
            $(select).chosen();
            for (var i = 0; i < data.length; i++) {
                $(select).append($("<option></option>", {value: data[i].ter_id, text: data[i].ter_name}));
            }
            $(select).trigger("chosen:updated");
            $(select).chosen().change(function () {
                if (this.value) {
                    removeStr(this);
                }
            });
        } else {
            var endBut = $("<button></button>",
                    {text: "зарегистрировать",
                        type: 'button',
                        id: 'endButton',
                        class: 'writeBut',
                        'data-regionId': region,
                        click: writeUser
                    });
            $("#reestrForm").append(endBut);
        }
    });
}

function writeUser(  ) {
    if (validateElement($("#name")) && validateElement($("#email"))) {
        var regionId = $("#endButton").attr('data-regionId');
        var username = $("#name").val();
        var useremail = $("#email").val();
        $.post("server.php",
                {name: username, email: useremail, regionId: regionId},
                function (data) {
                    if (data && data.status) {
                        if (data.status == "ok") {
                            $("#level1").nextAll('*').remove();
                            $("#name,#email").val('');
                        }
                        var message = data.message || "Sorry...server Error";
                        var modalWindow = $("<div class='modalWindow'>" + message + "<div>");
                        $(modalWindow).on("click", function () {
                            $(this).remove();
                        });
                        $("#reestation").append(modalWindow);
                    }
                });
    }

}

