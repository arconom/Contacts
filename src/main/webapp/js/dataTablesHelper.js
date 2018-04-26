/*jQuery dataTables helpers*/
/*
 * returns an object with the following entry points
 *
 * setupViewModel: function (scope, targetSelector, queryUrl, query, columns, columnReorderEnabled, pagingEnabled, height)
 * This sets up the rendering and the subscriptions for a basic data table.
 *
 * getCustomControl: function (id, scopeSelector)
 * Configure a custom control and append an instance of it to the target scope
 * @param {guid} id - will be used as the id attr for the custom element created in the template
 * @param {string} scopeSelector - defines the element that will receive a new child
 * @returns {promise} resolves when the custom control is finished being defined
 *
 */
function DataTablesHelper()
{
    // Instance stores a reference to the Singleton
    var instance;

    /*
     * Sets up the instance properties.
     */
    function init()
    {
        //this is a template for markup.  it has the attributes that dataTables supports
        //<td data-sort="" data-filter="" data-search="21st November 2016 21/11/2016" data-order="1479686400">21st November 2016</td>

        // Singleton
        // Private methods and variables

        var dateRangeFiltering = false,
                numberRangeFiltering = false,
                webComponentSetup = false;

        /**
         * adds a date picker to a column header in a DataTable and then returns a reference to it
         * @param {string} column identifies the column in which to create the date picker
         * @returns {object} a date picker control
         */
        function addDatePickerFilter(column)
        {
            //console.log("AddDatePickerFilter", title, column);
            var markup = '<input type="text" class="datepicker"/>',
                    changeEvent = function ()
                    {
                        var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                                );

                        column
                                .search(val ? "^" + val + "$" : "", true, false)
                                .draw();
                    },
                    clickEvent = function (e)
                    {
                        e.stopPropagation();
                    };

            return addFilter(column, markup, changeEvent, function () { }, clickEvent);
        }

        /**
         * adds two date pickers to a column header in a DataTable and then returns a reference to them
         * @param {string} column identifies the column in which to create the date pickers
         * @returns {object} a date picker control
         */
        function addDateRangeFilter(column)
        {
            //console.log("AddDateRangeFilter", column);
            var beginDate = '<div><label>Min</label><input type="text" class="datepicker" data-key="beginDate" placeholder="Start Date mm/dd/yyyy"/></div>',
                    endDate = '<div><label>Max</label><input type="text" class="datepicker" data-key="endDate" placeholder="End Date mm/dd/yyyy"/></div>',
                    markup = beginDate + endDate,
                    changeEvent = function ()
                    {
                        //var beginDateValue = $(this).parent().children('[data-key="beginDate"]').val();
                        //var endDateValue = $(this).parent().children('[data-key="endDate"]').val();
                        //var val = $.fn.dataTable.util.escapeRegex(
                        //    $(this).val()
                        //);

                        column
                                //    .search($.fn.dataTable.util.escapeRegex(Helper.GetDateRangeRegex(beginDateValue, endDateValue)), true, false)
                                .draw();
                    },
                    clickEvent = function (e)
                    {
                        e.stopPropagation();
                    };

            //don't want to push a bunch of the same function into the dataTables prototype,
            //so we gate it with a switch
            if (!dateRangeFiltering)
            {
                setupDateRangeFiltering();
            }


            return addFilter(column, markup, changeEvent, function () { }, clickEvent);
        }

        /**
         * adds two text fields to a column header in a DataTable and then returns a reference to them
         * @param {string} column identifies the column in which to create the text fields
         * @returns {object} a text field
         */
        function addNumberRangeFilter(column)
        {
            //console.log("addNumberRangeFilter", column);
            var minValue = '<div><label>Min</label><input type="text" class="minRange" data-key="minValue" placeholder="Type to filter.  Press enter to query."/></div>',
                    maxValue = '<div><label>Max</label><input type="text" class="maxRange" data-key="maxValue" placeholder="Type to filter.  Press enter to query."/></div>',
                    markup = minValue + maxValue,
                    changeEvent = function ()
                    {
                        column.draw();
                    },
                    clickEvent = function (e)
                    {
                        e.stopPropagation();
                    };

            //don't want to push a bunch of the same function into the dataTables prototype,
            //so we gate it with a switch
            if (!numberRangeFiltering)
            {
                setupNumberRangeFiltering();
            }

            return addFilter(column, markup, changeEvent, function () { }, clickEvent);
        }

        /**
         * adds a select control to a column header in a DataTable and then returns a reference to it
         * @param {string} column identifies the column in which to create the date pickers
         * @returns {object} a select control
         */
        function addSelectFilter(column, multi)
        {
            //console.log("addSelectFilter", column);

            var multiAttribute = multi ? ' multiple' : '',
                    markup = '<select' + multiAttribute + '><option value=""></option></select>',
                    keyupEvent = function () { },
                    changeEvent = function ()
                    {
                        let value = $(this).val();

                        //console.log("value", value);
                        //console.log("$(this)", $(this));
                        //console.log("this", this);

                        if ((typeof value === "object") && (value.length > 0))
                        {
                            value = value.join("|")
                        }

                        if (typeof value !== "string")
                        {
                            value = "";
                        }

                        column
                                .search(value ? "^" + value + "$" : "", true, false)
                                .draw();
                    },
                    clickEvent = function (e)
                    {
                        e.stopPropagation();
                    };

            function getSelectedOptions(scope)
            {
                var returnMe = [],
                        opt,
                        i;

                for (i = 0; i < scope.options.length; i++)
                {
                    opt = scope.options[i];

                    if (opt.selected)
                    {
                        opts.push(opt);
                    }
                }

                return returnMe;
            }

            return addFilter(column, markup, changeEvent, keyupEvent, clickEvent);
        }

        /**
         * adds an input type control text to a column header in a DataTable and then returns a reference to it
         * @param {string} title is used in the placeholder to alert the user what the field is used for
         * @param {string} column identifies the column in which to create the date pickers
         * @returns {object} an input type text control
         */
        function addTextFilter(title, column)
        {
            //console.log("addTextFilter", title, column);
            var markup = '<input type="text" alt="Type to filter.  Press enter to query. ' + title + '" placeholder="Type to filter.  Press enter to query. ' + title + '" />',
                    keyupEvent = function ()
                    {
                        if (column.search() !== this.value)
                        {
                            column
                                    .search(this.value)
                                    .draw();
                        }
                    },
                    clickEvent = function (e)
                    {
                        e.stopPropagation();
                    };

            return addFilter(column, markup, function () { }, keyupEvent, clickEvent);
        }

        /**
         * adds a control to a column header in a DataTable and then returns a reference to it
         * @param {string} column identifies the column in which to create the date pickers
         * @param {string} markup will be inserted into the header
         * @param {function} changeEvent will be setup on the added control
         * @param {function} keyupEvent will be setup on the added control
         * @param {function} clickEvent will be setup on the added control
         * @returns {object} a control
         */
        function addFilter(column, markup, changeEvent, keyupEvent, clickEvent)
        {
            //console.log("addFilter");//, column, markup, changeEvent, keyupEvent, clickEvent);
            var control = $(markup)
                    .appendTo($(column.header()))
                    .on("change", changeEvent)
                    .on("keyup", keyupEvent)
                    .on("click", clickEvent);

            return control;
        }

        /*
         jQuery Data Tables doesn't support footers, so this will add them directly into the DOM
         
         @param {DataTable} context - the JQuery DataTable that needs a footer added
         @param {int} numColumns - the number of columns in the table
         */
        function addFooter(selector, numColumns)
        {
            //console.log("addFooter", selector, numColumns);
            var footStr = "<tfoot>" +
                    "<tr>";

            for (i = 0; i < numColumns; i++)
            {
                footStr += "<th></th>";
            }

            footStr += "</tr>" +
                    "</tfoot>";

            $(selector).html($(selector).html() + footStr);
        }

        /**
         * Queries a given object array for objects with [filter] matching query
         * @param {string} query is compared against all items in columns
         * @param {array} columns is the list of objects used to initialise the DataTable
         * @returns {array} indexes of all matching columns
         */
        function getColumnIndex(query, columns)
        {
            //console.log("GetColumnIndex(query, columns)", query, columns);
            var matches = columns.filter(query),
                    returnMe = [];

            matches.forEach(function (x)
            {
                returnMe.push(columns.indexOf(x));
            });

            return returnMe;
        }

        /*
         * Sets up a filtering event that occurs each time the DataTable is drawn
         */
        function setupNumberRangeFiltering()
        {
            $.fn.dataTableExt.afnFiltering.push(
                    function (oSettings, aData, iDataIndex)
                    {
                        var returnMe = true;

                        oSettings.aoColumns.forEach(function (column)
                        {
                            if (column.filter === "numberRange")
                            {
                                var minValue = parseFloat($(column.nTh).find('[data-key="minValue"]').val()) || "",
                                        maxValue = parseFloat($(column.nTh).find('[data-key="maxValue"]').val()) || "",
                                        currentValue = parseFloat(aData[column.idx]);

                                if (!Helper.sorting.between(minValue, maxValue, currentValue))
                                {
                                    returnMe = false;
                                }
                            }
                        });

                        return returnMe;
                    });

            numberRangeFiltering = true;
        }

        /**
         * Sets up a filtering event that occurs each time the DataTable is drawn
         * must be done this way because using the column.search() function requires regex
         * and date range regex is a pain
         */
        function setupDateRangeFiltering()
        {
            //console.log("setupDateRangeFiltering");
            //this function will run every time the table is rendered, once per row I believe,
            //sending table info into oSettings and row data into aData
            $.fn.dataTableExt.afnFiltering.push(
                    function (oSettings, aData, iDataIndex)
                    {
                        var returnMe = true;

                        oSettings.aoColumns.forEach(function (column)
                        {
                            if (column.filter === "dateRange")
                            {
                                //need to find the input fields for the dates.
                                //they are in the header, so nTh should point there
                                var beginDateValue = $(column.nTh).find('[data-key="beginDate"]').val() || "",
                                        endDateValue = $(column.nTh).find('[data-key="endDate"]').val() || "",
                                        date = [],
                                        temp,
                                        a;

                                beginDateValue = beginDateValue.substring(6, 10) + beginDateValue.substring(0, 2) + beginDateValue.substring(3, 5);
                                endDateValue = endDateValue.substring(6, 10) + endDateValue.substring(0, 2) + endDateValue.substring(3, 5);

                                //formatter yyyymmdd
                                temp = aData[column.idx].toString()
                                        //truncate the time
                                        .split(" ")[0]
                                        .split("T")[0]
                                        .split("/")
                                        .reverse();
                                a = temp[2];
                                temp[2] = temp[1];
                                temp[1] = a;


                                temp.forEach(function (datePart)
                                {
                                    if (datePart && datePart.length === 1)
                                    {
                                        date.push("0" + datePart);
                                    } else
                                    {
                                        date.push(datePart);
                                    }
                                });

                                date = date.join("");

                                if (!Helper.sorting.between(beginDateValue, endDateValue, date))
                                {
                                    returnMe = false;
                                }
                            }
                        });

                        return returnMe;
                    }
            );
            dateRangeFiltering = true;
        }

        /**
         * Bind event handlers to the row details controls.
         * Build a template for each row.
         * Keep track of expanded row indexes.
         * Execute $.DataTable() on each table displayed every redraw.  Inefficient.
         */
        function setupRowDetails(columns, context)
        {
            console.log("setupRowDetails");

            var detailsColumns = getColumnIndex(function (x) {
                return !!x.getColumns;
            }, columns);

            context.api().columns().every(function ()
            {
                let column = this,
                        title = $(this).text();

                var index = detailsColumns.indexOf(column[0][0]);

                if (index !== -1)
                {
                    bindEvents(column, context, columns[index]);
                }

            });

            /*
             * Bind the click event to the detail toggler.
             * Bind the detail toggler clicker event to the table Draw function.
             */
            function bindEvents(column, context, details)
            {
                console.log("bindEvents", column, context);
                // Array to track the ids of the details displayed rows
                var detailRows = [];

                $(context).on('click', 'td.details-control', function ()
                {
                    console.log("details clicked");

                    var tr = $(this).closest('tr')
                            , row = context.api().row(tr)
                            , idx = $.inArray(tr.attr('id'), detailRows);

                    if (row.child.isShown())
                    {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');

                        // Remove from the 'open' array
                        detailRows.splice(idx, 1);
                    } else
                    {
                        // Open this row
                        var tableId = Helper.generateHTMLElementId()
                                , rowId = Helper.generateHTMLElementId()
                                , promise = new Promise(function (resolve, reject)
                                {
                                    var data = row.data().sub;
                                    resolve(data);
                                    return data;
                                })
                                , func = function (callback)
                                {
                                    callback(row.data().sub);
                                };

                        row.child("<div id=\"" + rowId + "\" class=\"sub-table-container\"><table id=\"" + tableId + "\" class=\"display\"></table></div>").show();
                        tr.addClass('shown');

                        var dt = setupViewModel(document, "#" + tableId, "", promise, details.getColumns, true, true, "100%");

                        // Add to the 'open' array
                        if (idx === -1)
                        {
                            detailRows.push(tr.attr('id'));
                        }
                    }
                });

                // On each draw, loop over the `detailRows` array and show any child rows
                $(context).on('draw', "", function ()
                {
                    $.each(detailRows, function (i, id)
                    {
                        $('#' + id + ' td.details-control').trigger('click');
                    });
                });
            }
        }

        /*
         * Defines the custom control for jQueryDataTables
         * @param {string} id - the id to apply to the instance of the template that will be added to the DOM
         */
        function setupCustomControl(id)
        {
            //Create an id for the data table instance
            //so we don't get our wires crossed
            //when there is more than one data table in the DOM
            document.body.insertAdjacentHTML("beforeend", getJQueryDataTableTemplate());

            // See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
            // for the list of other DOM interfaces.
            class jQueryDataTable extends HTMLElement
            {
                constructor()
                {
                    //console.log("jQueryDataTable constructor");
                    // always call super() first in the ctor.
                    super();

                    //todo probably need to move this into a library and pass in the context to make it reusable
                    //setup shadow DOM
                    //let shadowRoot = this.attachShadow({ mode: "open" });
                    this.id = id;
                    const t = document.querySelector("#jQuery-DataTable-Template");
                    const instance = t.content.cloneNode(true);
                    //shadowRoot.appendChild(instance);
                    this.appendChild(instance);
                }

                static get observedAttributes()
                {
                    return ["width", "height"];
                }

                connectedCallback()
                {
                    //console.log("connectedCallback");
                }
                disconnectedCallback()
                {
                    //console.log("disconnectedCallback");
                }
                attributeChangedCallback(attrName, oldVal, newVal)
                {
                    //console.log("attributeChangedCallback");

                    //height changed
                    if (attrName == "height")
                    {
                        //adjust the height of the scrollable area
                        $('div.dataTables_scrollBody').height(newVal);
                    }
                }
                adoptedCallback()
                {
                    //console.log("adoptedCallback");
                }
            }

            customElements.define(getCustomControlName(), jQueryDataTable);
            return customElements.whenDefined(getCustomControlName());
        }

        /*
         This sets up the rendering and the subscriptions for a basic data table.
         
         @param {function} renderCallback - runs at render time
         @param {string} targetSelector - references the html element to contain the data table
         @param {string} queryUrl - contains a reference to a controller that will return data
         @param {Promise} query - executes query
         @param {array(object)} columns - is used to configure the data table
         
         [
         {
         // the value of "data" corresponds to an object key
         "data": "cell0",
         
         // the value of "title" determines the column header
         "title": "Pri",
         
         // the render function should return some markup to render the value of "data"
         render: $.fn.dataTable.render.text() ||
         render: function (data, type, row)
         {
         return "<a href=\"" + encodeURI("ipeWorkloadStatusDisplay.asp?wonum=" + data) + "\" class=\"link\">" + data + "</a>";
         },
         
         // filter is a string which indicates what kind of control to render in the column header for filtering
         "filter": "datePicker" || "dateRange" || "dropdown" || "numberRange" || "text"
         }
         ];
         
         */
        function setupViewModel(scope, targetSelector, queryUrl, query, columns, columnReorderEnabled, pagingEnabled, height)
        {
            console.log("setupViewModel", scope, targetSelector, queryUrl, query, columns, columnReorderEnabled, pagingEnabled, height);

            var viewModel = {
                //data defines the CRUD for the view
                data: (function ()
                {
                    var _all = [];

                    return {
                        get: function ()
                        {
                            return _all;
                        },
                        set: function (value)
                        {
                            console.log("data.set", value);
                            _all = value;
                            PubSub.publish("data" + targetSelector + ".change", this);
                        },
                        add: function (value)
                        {
                            _all.push(value);
                            PubSub.publish("data" + targetSelector + ".change", this);
                        },
                        //todo maybe add a url, data, and callback parameter to this function and use the ones passed into the setupViewModel function as defaults
                        update: function ()
                        {
                            query(queryUrl, null, this.set);
                        },
                        /**
                         * Generate test data
                         * @returns {object} with all keys containing randomly generated values
                         */
                        generateRow: function ()
                        {
                            //console.log("generateRow");

                            var returnMe = {};

                            columns.forEach(function (columns)
                            {
                                returnMe[column.data] = Helper.generateGuid();
                            });

                            return returnMe;
                        }
                    };
                })(),
                // ui level data goes here. and functions too.
                ui:
                        {
                            //references to DataTables, needed for redrawing
                            table: null,
                            /**
                             * Sets up subscriptions
                             */
                            bind: function ()
                            {
                                PubSub.subscribe("data" + targetSelector + ".change", this.redraw, this);
                            },
                            events: {},
                            /**
                             * Hides the tabs that contain the tables
                             */
                            hide: function ()
                            {
                                $(scope).find(targetSelector).hide();
                            },
                            /**
                             * redraws a dataTable, saving the current scroll position and maintaining focus
                             */
                            redraw: function ()
                            {
                                console.log("ui.redraw");
                                redrawTable(viewModel.data.get(), this.table, scope, targetSelector);

                                /*
                                 * @param {array} data is an array with each index representing a row of data
                                 * @param {object} table is a jQuery DataTable to be redrawn
                                 * @param {string} selector identifies the html table that corresponds to the jQuery DataTable
                                 */
                                function redrawTable(data, table, scope, selector)
                                {
                                    if (table)
                                    {
                                        var scroll = $(scope).find(selector).parent().scrollTop();
                                        table
                                                .clear()
                                                .rows
                                                .add(data)
                                                .draw(false);
                                        $(scope).find(selector).focus();
                                        $(scope).find(selector).parent().scrollTop(scroll).focus();
                                    }
                                }
                            },
                            /**
                             * Sets up the DataTable and populates it with data
                             * @param {object} should have properties: add, get, set,
                             * search
                             * 
                             *                      
                             */
                            render: function (data)
                            {
                                console.log("ui.render", data);
                                var that = this;

                                this.show();
                                load(viewModel.data.get());

                                function load(data)
                                {
                                    console.log("ui.load", data);

                                    that.table = loadFromObjectArray(scope
                                            , targetSelector
                                            , data
                                            , columns
                                            , function () { }
                                    , function () { }
                                    , columnReorderEnabled
                                            , pagingEnabled
                                            , height);

                                    Helper.setupInfiniteScroll(scope, targetSelector, 200, -400, function ()
                                    {
//                                query for more data
//                                data.add(data.generate());
//                                throw "Not Implemented";
                                    });
                                }
                            },
                            /**
                             * Displays the tab and the tables it contains
                             */
                            show: function ()
                            {
                                console.log("ui.show");
                                $(scope).find(targetSelector).show()
                                        .height("auto").addClass("display");
                            }
                        },
                /**
                 * Sets up bindings,
                 * Gets data,
                 * Renders table
                 */
                init: function ()
                {
                    console.log("vm.init");
                    var promises = [],
                            printMe = "",
                            self = this;

                    self.ui.bind();

                    if (!!query)
                    {
                        if (typeof (query) === "function")
                        {
                            //this is a function that takes a callback
                            //put all the promises from the ajax into an array for processing
                            promises.push(query(queryUrl, null, function (data)
                            {
//                                todo add some logic to try and parse a string of json data
//                                self.data.set(Helper.json.tryParse(data));
                                self.data.set(data);
                            }));
                        } else if ((typeof (query) === "object") && (!!query.then))
                        {
                            promises.push(query.then(function (data)
                            {
                                self.data.set(Helper.json.tryParse(data));
                            }));
                        }

                        //process the promises
                        $.when.apply($, promises).then(function ()
                        {
                            // returned data is in arguments[0][0], arguments[1][0], ... arguments[9][0]
                            // setup the tables
                            self.ui.render(self.data);
                        }, function ()
                        {
                            console.log("Error during rendering");
                            throw "Error during rendering";
                        });
                    } else
                    {
                        console.log("no data query");
                    }
                }
            };
            viewModel.init();
            return viewModel;
        }

        /*
         * This returns the HTML template for the data table
         */
        function getJQueryDataTableTemplate()
        {
            //console.log("getJQueryDataTableTemplate");

            return "<template id=\"jQuery-DataTable-Template\">"
                    + "<style>"
                    + "</style>"
                    + "<table></table>"
                    + "</template>";
        }

        /*
         * Get the custom control name to be used for this implementation
         */
        function getCustomControlName()
        {
            return "jquery-datatable";
        }

        /*
         * Setup Filters
         */
        function setupFilters(columns, context)
        {
            //I use the columns data to determine what kind of controls to use for filtering
            var textIndexes = getColumnIndex(function (x) {
                return x.filter === "text";
            }, columns),
                    dropdownIndexes = getColumnIndex(function (x) {
                        return x.filter === "dropdown";
                    }, columns),
                    multiSelectIndexes = getColumnIndex(function (x) {
                        return x.filter === "multiSelect";
                    }, columns),
                    datePickerIndexes = getColumnIndex(function (x) {
                        return x.filter === "datePicker";
                    }, columns),
                    dateRangeIndexes = getColumnIndex(function (x) {
                        return x.filter === "dateRange";
                    }, columns),
                    numberRangeIndexes = getColumnIndex(function (x) {
                        return x.filter === "numberRange";
                    }, columns);

            context.api().columns().every(function ()
            {
                let column = this,
                        title = $(this).text();

                if (textIndexes.indexOf(column[0][0]) !== -1)
                {
                    addTextFilter(title, column);
                }

                if (dropdownIndexes.indexOf(column[0][0]) !== -1)
                {
                    let select = addSelectFilter(column, false);

                    column.data().unique().sort().each(function (d, j)
                    {
                        select.append('<option data-id="' + j + '" value="' + d + '">' + d + '</option>');
                    });
                }

                if (multiSelectIndexes.indexOf(column[0][0]) !== -1)
                {
                    let select = addSelectFilter(column, true);

                    column.data().unique().sort().each(function (d, j)
                    {
                        select.append('<option data-id="' + j + '" value="' + d + '">' + d + '</option>');
                    });
                }

                if (datePickerIndexes.indexOf(column[0][0]) !== -1)
                {
                    addDatePickerFilter(column);
                }

                if (dateRangeIndexes.indexOf(column[0][0]) !== -1)
                {
                    addDateRangeFilter(column);
                }

                if (numberRangeIndexes.indexOf(column[0][0]) !== -1)
                {
                    addNumberRangeFilter(column);
                }
            });
        }

        /*
         this is not ready for use yet.  It probably needs to take a function for the ajax parameter
         selector gets the table
         dataSource is the result of an ajax request
         
         @param {string} selector - targets the table
         @param {array<object>} dataSource - is an array of objects that have properties that map to the columns parameter
         @param {array<string>} columns - determines which properties from the dataSource to load into columns
         */
        function loadFromAjax(selector, dataSource, columns)
        {
            //console.log("loadFromAjax", selector, dataSource, columns);
            throw "loadFromAjax is not implemented";

            //$(selector).DataTable({
            //
            //    "ajax": function (data, callback, settings) {
            //        saveToDataStore(WebStorage.GetAll(), 'data');
            //    },
            //
            //    //add a link for each item
            //    "dataSrc": function (json) {
            //        for (var i = 0, ien = json.length ; i < ien ; i++) {
            //            json[i][0] = '<a href="/message/' + json[i][0] + '>View message</a>';
            //        }
            //        return json;
            //    },
            //
            //    "columns": columns,
            //
            //    //to render links
            //    "render": function (data, type, full, meta) {
            //        return '<a href="' + data + '">Download</a>';
            //    }
            //});
        }

        /*
         this is not ready for use
         @param {string} selector - targets the table
         @param {array<object>} dataSource - is an array of objects that have properties that map to the columns parameter
         @param {array<string>} columns - determines which properties from the dataSource to load into columns
         //{ title: "Name" },
         */
        function loadFromArray(selector, dataSource, columns)
        {
            //console.log("loadFromArray", selector, dataSource, columns);
            throw "loadFromArray is not implemented";

            //$(selector).DataTable({
            //    data: datasource,
            //    "columns": columns,
            //});
        }

        /*
         @param {string} selector - targets the table
         @param {array<object>} dataSource - is an array of objects that have properties that map to the columns parameter
         @param {array<string>} columns - determines which properties from the dataSource to load into columns
         
         @param {function} dataSrcCallback - runs for every row
         example
         //add a link for each item
         function (json) {
         for (var i = 0, ien = json.length ; i < ien ; i++) {
         json[i][0] = '<a href="/message/' + json[i][0] + '>View message</a>';
         }
         return json;
         },
         
         @param {function} renderCallback - runs at render time
         example
         //add a link for each item
         function (data, type, full, meta) {
         return '<a href="' + data + '">Download</a>';
         }
         */
        function loadFromObjectArray(scope, selector, dataSource, columns, dataSrcCallback, renderCallback, columnReorderEnabled, pagingEnabled, height)
        {
            console.log("loadFromObjectArray", "scope", scope, "selector", selector, "dataSource", dataSource, "columns", columns, "dataSrcCallback", dataSrcCallback, "renderCallback", renderCallback);

            if (!scope) {
                scope = document;
            }

            try
            {
                var returnMe = $(scope).find(selector).DataTable({
                    "autoWidth": true,
                    "data": dataSource,
                    //"" makes this point to the root of the object rather than the data property
                    "dataSrc": "", //dataSrcCallback === undefined ? "" : dataSrcCallback,
                    "columns": columns,
                    "colReorder": columnReorderEnabled,
                    //"render": renderCallback === undefined ? null : renderCallback
                    //for some reason this causes column alignment issues
                    scrollCollapse: true,
                    paging: pagingEnabled,

                    //im not sure why the extra s needs to be there.  the documentation wasn't clear
                    "sScrollY": height,
                    "scrollX": true,
                    //"fnDrawCallback": adjust(selector)
                    initComplete: function ()
                    {
                        var self = this;
                        setupFilters(columns, self);
                        setupRowDetails(columns, self)
                    }
                });

                console.log("loadFromObjectArray returning", returnMe);

                return returnMe;
            } catch (e)
            {
                console.log(e);
                throw e;
            }

        }

        return {
            /*
             * Configure a custom control and append an instance of it to the target scope
             *
             * @param {guid} id - will be used as the id attr for the custom element created in the template
             * @param {string} scopeSelector - defines the element that will receive a new child
             * @returns {promise} resolves when the custom control is finished being defined
             */
            getCustomControl: function (id, scopeSelector)
            {
                var ctor;

                //we only need to do the setup once per page
                if (!this.webComponentSetup)
                {
                    setupCustomControl(id);
                }

                ctor = customElements.get(getCustomControlName());
                return new ctor();
            },

            /*
             This sets up the rendering and the subscriptions for a basic data table.
             
             
             @param {string} scope
             @param {string} targetSelector - references the html element to contain the data table
             @param {string} queryUrl - contains a reference to a controller that will return data
             @param {function} query - will execute on a successful query
             @param {array(object)} columns - is used to configure the data table
             [
             {
             // the value of "data" corresponds to an object key
             "data": "key",
             
             // the value of "title" determines the column header
             "title": "Column Title",
             
             // the render function should return some markup to render the value of "data"
             render: $.fn.dataTable.render.text() ||
             render: function (data, type, row)
             {
             return "<a href=\"" + encodeURI("ipeWorkloadStatusDisplay.asp?wonum=" + data) + "\" class=\"link\">" + data + "</a>";
             },
             
             // filter is a string which indicates what kind of control to render in the column header for filtering
             "filter": "datePicker" || "dateRange" || "dropdown" || "numberRange" || "text"
             
             "className": 'details-control'
             "orderable": false
             "data": "sub"
             "defaultContent": ''
             "getColumns":
             [
             {
             "data": "id",
             "title": "Id",
             render: function (data, type, row)
             {
             return "<a href=\"" + encodeURI("url.asp?id=" + data) + "\" class=\"link\">" + data + "</a>";
             },
             "filter": "text"
             },
             {
             "data": "name",
             "title": "Name",
             render: $.fn.dataTable.render.text(),
             "filter": "text"
             },
             {
             "data": "description",
             "title": "Description",
             render: $.fn.dataTable.render.text(),
             "filter": "text"
             },
             {
             "data": "date",
             "title": "Date",
             "filter": "dateRange"
             },
             ]
             
             },
             
             }
             ];
             @param {bool} columnReorderEnabled
             @param {bool} pagingEnabled
             @param {string} height
             
             */
            setupViewModel: function (scope, targetSelector, queryUrl, query, columns, columnReorderEnabled, pagingEnabled, height)
            {
                return setupViewModel(scope, targetSelector, queryUrl, query, columns, columnReorderEnabled, pagingEnabled, height);
            }
        };
    }

    return {
        getInstance: function ()
        {
            if (!instance)
            {
                instance = init();
            }
            return instance;
        }
    }
}
;