var viewModel;
NodeList.prototype.forEach = Array.prototype.forEach;
$(function ()
{
    var queryUrl = "http://localhost:8080/Rest/ContactsManager/Contacts/List",
        tutorial = getTutorial(),
        urlRoot = "http://localhost:8080/Rest/ContactsManager/Contacts";
    viewModel = getDataTable("#container"
        , getTable()
        , queryUrl
        , read
        , getColumns());
    tutorial.notifyOnce();
    bindEvents();
    function bindEvents() {
        console.log("bindEvents");
        setupEditToggleEvent();

        $("#container").on("click", "button.destroy", function () {
            deleteHandler(this);
        });

        $("#btnCreate").click(function () {
            if ((validatePhoneNumber($("#txtPhone").val()))
                && (validateEmail($("#txtEmail").val()))) {
                createHandler();
            } else {
                alert("Invalid data");
            }
        });

        $("#container").on("blur", ".updateField", function () {
            if ($(this).closest("td")[0].className.indexOf("email") > 0) {
                if (validateEmail($(this).val())) {
                    updateHandler(this);
                }
            } else if ($(this).closest("td")[0].className.indexOf("phone") > 0) {
                if (validatePhoneNumber($(this).val())) {
                    updateHandler(this);
                }
            } else {
                updateHandler(this);
            }
        });

        $("#container").on("keyup", ".updateField", function () {
            if ($(this).closest("td")[0].className.indexOf("email") > 0) {
                if (validateEmail($(this).val())) {
                    $(this).removeClass("error")
                } else {
                    $(this).addClass("error")
                }
            }
            if ($(this).closest("td")[0].className.indexOf("phone") > 0) {
                if (validatePhoneNumber($(this).val())) {
                    $(this).removeClass("error")
                } else {
                    $(this).addClass("error")
                }
            }

        });

        $("#txtEmail").keyup(function () {
            if (validateEmail($(this).val())) {
                $(this).removeClass("error")
            } else {
                $(this).addClass("error")
            }
        });

        $("#txtPhone").keyup(function () {
            if (validatePhoneNumber($(this).val())) {
                $(this).removeClass("error")
            } else {
                $(this).addClass("error")
            }
        });

        $(".tutorial").click(function () {
            tutorial.start();
        });

        function validatePhoneNumber(value) {
            return new RegExp(/^\d{3}[-.]?\d{3}[-.]?\d{4}$/).exec(value) !== null;
        }
        function validateEmail(value) {
            return new RegExp(/[\w.-_]+@[\w.-_]+\.[\w.-_]+/).exec(value) !== null;
        }

        function createHandler() {
            create(urlRoot
                , JSON.stringify({
                    firstName: $("#txtFirstName").val(),
                    lastName: $("#txtLastName").val(),
                    email: $("#txtEmail").val(),
                    address: $("#txtAddress").val(),
                    phone: $("#txtPhone").val()
                })
                , function () {
                    viewModel.data.update();
                    viewModel.ui.table.draw();
                });
        }
        function deleteHandler(scope) {
            var row = viewModel.ui.table.row($(scope).closest("tr"));
            var rowData;
            var id;
            rowData = row.data();
            id = rowData.id;
            row.remove();
            viewModel.ui.table.draw();
            destroy(urlRoot + "/" + id, function () {
                viewModel.data.update();
            });
        }
        function updateHandler(scope) {
            var rowData;
            var value = $(scope).val();
            var cell = $(scope).closest("td");
            var row = $(scope).closest("tr");
            viewModel.ui.table.cell(cell).data(value);
            rowData = viewModel.ui.table.row(row).data();
            toggleEditable(scope);
            viewModel.ui.table.draw();
            update(urlRoot + "/" + rowData.id
                , JSON.stringify(rowData)
                , function () {
                    viewModel.data.update();
                });
        }
        function toggleEditable(scope) {
            console.log("toggleEditable");
            //let's not cancel the active text field
            if ((scope.nodeName === "TD") && ($(scope).find(".updateField").length === 0))
            {
                convertToTextContent(".updateField");
                var element = $(scope).find("div");
                if (element.length > 0) {
                    convertToTextInput(element);
                }
            }
        }

        function convertToTextInput(scope) {
            console.log("value", $(scope).text());
            $(scope).closest("td").html("<input class=\"updateField\" value=\"" + $(scope).text() + "\">" + $(scope).val() + "</input>");
            $(".updateField").focus();
        }
        function convertToTextContent(scope) {
            $(scope).closest("td").html("<div>" + $(scope).val() + "</div>");
        }
        function setupEditToggleEvent() {
            $("#container").on("click", "td.firstName,td.lastName,td.email,td.address,td.phone", function () {
                toggleEditable(this);
            });
        }
    }
    function getDataTable(scopeSelector, table, queryUrl, dataCallback, columns)
    {
        console.log("createTable", scopeSelector, table, queryUrl, dataCallback, columns);
        var dataTablesHelper = DataTablesHelper().getInstance();
        document.querySelector(scopeSelector).appendChild(table);
        var returnMe = dataTablesHelper.setupViewModel(document
            , "#" + table.id
            , queryUrl
            , dataCallback
            , columns
            , true
            , true
            , "50vh");
        return returnMe;
    }
    function getTable()
    {
        console.log("setupTable");
        var newTable = document.createElement("table");
        newTable.id = Helper.generateHTMLElementId();
        newTable.cssClass = "display";
        newTable.style = "width: 100%;";
        return newTable;
    }
    /*
     * Sets up columns for the data table
     * determines the column order,
     * the filter type,
     * and the rendering logic
     */
    function getColumns()
    {
        console.log("getColumns");
        var returnMe =
            [
                {
                    "class": "firstName",
                    "data": "firstName",
                    "title": "First Name",
                    render: function (data, type, row)
                    {
                        return "<div>" + data + "</div>";
                    },
                    "filter": "text"
                },
                {
                    "class": "lastName",
                    "data": "lastName",
                    "title": "Last Name",
                    render: function (data, type, row)
                    {
                        return "<div>" + data + "</div>";
                    },
                    "filter": "text"
                },
                {
                    "class": "email",
                    "data": "email",
                    "title": "Email",
                    render: function (data, type, row)
                    {
                        return "<div>" + data + "</div>";
                    },
                    "filter": "text"
                },
                {
                    "class": "address",
                    "data": "address",
                    "title": "Address",
                    render: function (data, type, row)
                    {
                        return "<div>" + data + "</div>";
                    },
                    "filter": "text"
                },
                {
                    "class": "phone",
                    "data": "phone",
                    "title": "Phone",
                    render: function (data, type, row)
                    {
                        return "<div>" + data + "</div>";
                    },
                    "filter": "text"
                },
                {
                    "class": "actions",
                    "title": "Actions",
                    "defaultContent": "<button class=\"destroy button-medium button-red\">X</button>"
                }
            ];
        return returnMe;
    }
    function getTutorial() {
     
        var tempRow = null;
        
        return Tutorial("body",
            [
                {selector: ".new-contact", description: "Enter data in these fields and click the Create button to create a new Contact.  It should show up in the table below.", before: function () {}, after: function () {}}
                , {selector: "input[type=search]", description: "This field will execute a search on every column in the table.", before: function () {}, after: function () {}}
                , {selector: "thead > tr > th", description: "Each of these will filter on their corresponding column.", before: function () {}, after: function () {}}
                , {selector: "tr > td", description: "Click on a table cell to edit.", before: function () {
                        viewModel.ui.table.rows().clear();
                        tempRow = viewModel.ui.table.row.add({
                            firstName: "firstName"
                            , lastName: "lastName"
                            , email: "email"
                            , address: "address"
                            , phone: "phone"
                        });
                         viewModel.ui.table.draw();
                    }, after: function () {
                        viewModel.ui.table.row(tempRow).remove();
                         viewModel.ui.redraw();
                    }}
            ]).getInstance();
    }

//crud
    function update(url, data, doneCallback) {
        console.log("update", "url", url, "data", data);
        $.ajax({
            type: "PUT",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: doneCallback,
            failure: function () {
            }
        });
    }
    function read(url, data, doneCallback) {
        $.ajax({
            type: "GET",
            url: url,
            data: data,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: doneCallback,
            failure: function () {
                alert("failure retrieving data");
                doneCallback({});
            }
        });
    }
    function destroy(url, doneCallback) {
        $.ajax({
            type: "DELETE",
            url: url
            , success: function (data) {},
            failure: function () {}
        });
    }
    function create(url, data, doneCallback) {
        $.ajax({
            type: "POST",
            url: urlRoot,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: doneCallback,
            failure: function (errMsg) {
            }
        });
    }
});