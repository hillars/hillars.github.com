$(document).ready(function() {
    localStorage.setItem("showconsole", 0);

    setInterval(tick, 5000);
    var ua = navigator.userAgent;

    console.log("Navi " + ua);

    if (TSPOS.Model.POS.name == "Lab OÜ / Labor SK10-3" && ua.indexOf('Android') == -1) { // DEsktop rPI
        if (ErplyEPSI.websocket && ErplyEPSI.websocket.readyState == ErplyEPSI.websocket.OPEN) {
            console.log("Disconnecting websocket");
            ErplyEPSI.disconnect();
        }
        ErplyEPSI.getWebSocketHost = function() {

            // ("https:" === document.location.protocol ? "wss://" : "ws://") + "127.0.0.1:5656/" + channel_name
            return ("https:" === document.location.protocol ? "wss://" : "ws://") + "192.168.1.13:5656/"
        }
        //alert(ErplyEPSI.getWebSocketHost());
        ErplyEPSI.openWebSocket();

    }

    if (TSPOS.Model.POS.name == "Lab OÜ / Labor SK10-4") {
        ErplyEPSI.getWebSocketHost = function() {

            // ("https:" === document.location.protocol ? "wss://" : "ws://") + "127.0.0.1:5656/" + channel_name
            return ("https:" === document.location.protocol ? "wss://" : "ws://") + "192.168.1.14:5656/"
        }
        //alert(ErplyEPSI.getWebSocketHost());
        ErplyEPSI.openWebSocket();

    }

    if(ua.indexOf('Android') !== -1) { // tablet Android
        if (ErplyEPSI.websocket && ErplyEPSI.websocket.readyState == ErplyEPSI.websocket.OPEN) {
            console.log("Disconnecting websocket");
            alert("Should disconnect?);
            ErplyEPSI.disconnect();
        }
        ErplyEPSI.getWebSocketHost = function() {

            // ("https:" === document.location.protocol ? "wss://" : "ws://") + "127.0.0.1:5656/" + channel_name
            return ("https:" === document.location.protocol ? "wss://" : "ws://") + "192.168.1.13:5656/"
        }
        //alert(ErplyEPSI.getWebSocketHost());
        ErplyEPSI.openWebSocket();
    }



    

    if (TSPOS.Model.POS.name == "Lab Club OÜ / Labor VP8-1") {

        let device

        TSPOS.Model.Document.openCashDrawer = function() {

            
            (async () => {
               try {

                    if (device == null) {
                        device = await navigator.usb.requestDevice({
                            filters: [{ vendorId: 0x067b }]
                          });
                        console.log("Device found")

                        opened = await device.open();
                        console.log("Device opened")

                        conf = await device.selectConfiguration(1);
                        console.log("Configuration selected: "+ conf)

                        await device.claimInterface(0);
                        console.log("Interface claimed: ")

                        i2 = await device.selectAlternateInterface(0,0)
                        console.log("Alternate Interface claimed: "+ i2)

                    }

                    if (device != null) {
                        cmd = new Uint8Array([1,2,3,4,5,6,7,8,9])
                        result = device.transferOut(2, cmd)

                        console.log(cmd)

                        console.log("Command sent: "+ result)
                        console.log(result)
                    }
                    

                    
                    
                } catch (err) {
                    console.error(err)
                }
            })();
            
            
        }

        console.log(ErplyEPSI.getWebSocketHost());

        if (ErplyEPSI.websocket && ErplyEPSI.websocket.readyState == ErplyEPSI.websocket.OPEN) {
            console.log("Disconnecting websocket");
            ErplyEPSI.disconnect();
        }

        var channel_name = TSPOS.Model.POS.getPointOfSaleByID(13).getAttributeValue("message_broker_channel_name")

        ErplyEPSI.getWebSocketHost = function() {
            //return ("https:" === document.location.protocol ? "wss://" : "ws://") + "127.0.0.1:5656/"
            return ("https:" === document.location.protocol ? "wss://" : "ws://") + "192.168.1.176:5656/" + channel_name
            //return ("https:" === document.location.protocol ? "wss://" : "ws://") + "localhost:5656/" + channel_name
        }

        console.log(ErplyEPSI.getWebSocketHost());
        ErplyEPSI.openWebSocket();
    }

    function tick() {
        //get the mins of the current time
        var mins = new Date().getMinutes();
        if(mins == "00") {
            setTimeout(refreshPricelist, 1000);
         }
    }

    function refreshPricelist() {
        TSPOS.Model.Document.applyPromotions()
    }

    // Määrab, millist funktsiooni ribakoodiskänner vaikimisi kutsub
    ScannerQueue.handler = getCustomers;

    window.makeCustomerRows = function(e, t) {
        var n = [];
        if ($.each(e, function(e, t) {

            // LAB edit
            if (t.customerCardNumber) return; // Kui kliendil on kliendikaart (ID-kaart)
            if (t.groupID == 18) return; // töötajad välja
            if (t.groupID == 22) return; // eridiilid endiste töötajatega välja
            // end LAB edit

            var r = $.trim("PERSON" == t.customerType ? t.firstName + " " + t.lastName : t.companyName)
              , o = TSPOS.Utility.stripHTML
              , a = $("<tr><td>" + o(r) + '</td><td class="customer-search-email">' + o(t.email) + '</td><td class="hidden-step-1">' + o(t.customerCardNumber) + '</td><td class="hidden-step-1">' + o(t.phone) + '</td><td class="customer-info-btn" style="height: 45px;"><span data-icon="&#xe107;" class="text-24px" style="position: absolute; top: 5px; right: 8px;"></span></td></tr>');
            a.find(".customer-info-btn").on("click", function(e) {
                e.preventDefault(),
                e.stopPropagation(),
                TSPOS.Model.Customer.getDetailedCustomerInfo(t.customerID)
            }),
            a.on("click", function(e) {
                var n = o("PERSON" == t.customerType ? t.firstName + " " + t.lastName : t.companyName);
                switch (TSPOS.Model.Customer.focusElement) {
                case "association":
                    $("#product-row-association").val(t.fullName),
                    TSPOS.Model.Document.currentProduct.searchedAssociation = {
                        id: t.id,
                        fullName: n
                    };
                    break;
                case "professional":
                    $("#product-row-professional").val(t.fullName),
                    TSPOS.Model.Document.currentProduct.searchedProfessional = {
                        id: t.id,
                        fullName: n
                    };
                    break;
                default:
                    selectCustomer(t)
                }
                $('[data-action="cancel-customer-search"]').trigger((isMobileDevice(),
                "click"))
            }),
            n.push(a)
        }),
        n.length > 0)
            $("#customer-search-result").html(n);
        else {
            var r = void 0 === t ? '<tr><td colspan="5" class="bold">' + __t("Type atleast 3 characters.") + "</td></tr>" : '<tr><td colspan="5" class="bold">' + __t('No results for: "{search_name}"').tprintf(t) + "</td></tr>";
            $("#customer-search-result").html(r)
        }
    }

    var customer_search_timer = null;
    $("body").on(TSPOS.UI.getInputEventType() + " keyboardChange", '[data-action="show-customer-search"]', function(e) {
        customer_search_timer && clearTimeout(customer_search_timer);
        var t = $(this);
        customer_search_timer = setTimeout(function() {

            if (search_request && search_request.reject(), t.val().length < 333) {
                //return void $("#customer-search-result").html('<tr><td colspan="5" class="bold">' + __t("Type atleast 3 characters.") + "</td></tr>");
                return void $("#customer-search-result").html('<tr><td colspan="5" class="bold">' + __t("") + "</td></tr>");
            }
            if(t.val().toUpperCase().indexOf("ESN") !== -1 || t.val().toUpperCase().indexOf("TTÜ") !== -1 || t.val().toLowerCase().indexOf("tud") !== -1)
                return void $("#customer-search-result").html('<tr><td colspan="5" class="bold">' + __t("Use barcode reader for this client") + "</td></tr>");

            search_request = getCustomers(t.val())
        }, 800)
    });

    setInterval(function() {
        $("#customer-search-result tr td:contains('TTÜ')").parent().hide();
    }, 1000);

    if (TSPOS.Model.POS.name == "Lab OÜ / Labor SK10-2" || TSPOS.Model.POS.name == "Lab OÜ / Labor SK10-3") {

        ErplyEPSI.getWebSocketHost = function() {
            return ("https:" === document.location.protocol ? "wss://" : "ws://") + "localhost:5656"
        }
    }

    ErplyAPI.getCustomers = function(e, t, n) {
        e.groupIDWithSubgroups = 14; // Kõik Default=14 grupi ja alamgruppide kliendid
        e.recordsOnPage = 100;
        return e || (e = {}), e.bulk ? ($.extend(e, {
            requestName: "getCustomers"
        }), e) : ErplyAPI.request("getCustomers", e, t, n)
    }

    Pager.determineMaxButtons = function() {
        var e, t = Pager.getButtonsLength();
        if (Pager.isPageOpen())
            if (Pager.groupOpen&&!Pager.subGroupsOpen) {
                var n = 4;
                TSPOS.Model.Employee.isProductAddingAllowed() && (n = 5), e = Pager.getPageMaxRecords(void 0, n)
            } else 
                e = Pager.getPageMaxRecords(void 0);
        else {
            /* BEGIN LAB EDIT */
            if(Pager.currentElement.data("page-type") == "product-group") {
                Pager.currentElement.attr("data-rows", 4);
            } else if (Pager.currentElement.data("page-type") == "product") {
                Pager.currentElement.attr("data-rows", 0);
            } else if (Pager.currentElement.data("page-type") == "sale-functions") {
                Pager.currentElement.attr("data-rows", 1);
            } else if (Pager.currentElement.data("page-type") == "functions") {
                Pager.currentElement.attr("data-rows", 1);
            }
            /* END LAB EDIT */
            e = Pager.getPageMaxRecords(Pager.currentElement.data("rows"), 0), t > e && (e = Pager.getPageMaxRecords(Pager.currentElement.data("rows"), 1));
        }
        return e
    }
    Pager.calculateGrid = function(e, t) {
        var n = e ? e: ".sub-page:visible";
        t && (n = ".sub-page"), 0 == Pager.pageMax && (Pager.pageMax = 1), $(n).each(function(e) {
            Pager.currentElement = $(this), $(this).find(".btn-added-js").remove();
            var t = Pager.determineMaxButtons(), n = Pager.getButtonsLength();
            Pager.currentElement.data("totalRecords") && (Pager.pageMax = Math.ceil(Pager.currentElement.data("totalRecords") / t)), $(this).css("width", Pager.getSingleRowWidth());
            for (var r = t, o = $('<button class="' + Pager.determineDummyButtonClass() + ' btn-added-js"/>'), a = [], i = 0; i < t - n; i++)
                a.push(o.clone());
            if (a.length > 0 && $(this).append(a), Pager.isPageOpen()) {
                var s = [];
                l = $('<button class="btn-home btn-added-js icon_house" data-pager-open="page" />');
                s.push(l)
                /* BEGIN LAB EDIT */
                //u = $('<button class="btn-home btn-added-js arrow_carrot-up_alt2" data-pager-open="page" />');
                /* END LAB EDIT */
                /*if (Pager.currentGroup && Pager.currentGroup.parentGroup) {
                    var c = Pager.currentGroup.parentGroup;
                    u.attr("data-pager-open", "product-group"), u.data("product-group", c)
                } else
                    u.addClass("disabled");
                if (s.push(l), Pager.groupOpen && s.push(u), TSPOS.Model.Employee.isProductAddingAllowed() && Pager.groupOpen&&!Pager.subGroupsOpen) {
                    var d = $('<button class="btn-plus btn-added-js icon_plus" data-view-type="add-product-group-view"></button>');
                    s.push(d)
                }*/
                $(this).prepend(s);
                var p = $("<button />").addClass("btn-page-left page-left btn-added-js arrow_carrot-left_alt2");
                1 == Pager.page && p.addClass("disabled"), Pager.groupOpen&&!Pager.subGroupsOpen && 2 == Pager.page && (p.removeClass("page-left"), p.attr("data-pager-open", "product-group"), p.data("product-group", Pager.currentGroup));
                var m = $("<button />").addClass("btn-page-right btn-added-js arrow_carrot-right_alt2");
                (Pager.page == Pager.pageMax || a.length > 0) && m.addClass("disabled"), $(this).append([p, m])
            } else {
                if (n > t) {
                    var f = $("<button>...</button>");
                    f.attr("class", "btn-more btn-added-js"), f.attr("data-pager-open", "page")
                }
                $(this).find("button:visible").eq(r).before(f)
            }
            TSPOS.EventManager.runEventListener("grid_section_rendered", Pager.currentElement)
        })
    }

    Pager.openGroup = function(e) {
        if (e) {
            if (TSPOS.UI.isEditMode()&&!e.hasClass("btn-home")&&!e.hasClass("btn-page-left"))
                return void TSPOS.Model.ProductGroup.addProductGroupView(e.data("product-group"));
            Pager.openElement = e.parent();
            var t = e.data("product-group"), n = e.data("pager-open")
        } else 
            var t = Pager.currentGroup, n = "product-group";
        Pager.currentGroup = t, Pager.groupOpen=!0, Pager.subGroupsOpen=!1, TSPOS.Model.Config.getBoolean("touchpos_product_groups_list_view") && (n = "product-group-full", $('[data-action="show-product-search"]').attr("placeholder", Pager.currentGroup.name), openProductSearch(), getProducts("")), Pager.page = 1;
        var r = [], o = 4;
        TSPOS.Model.Employee.isProductAddingAllowed() && (o = 5);
        var a = Pager.getPageMaxRecords(2, o), i = Pager.getPageMaxRecords(void 0, o);
        if ("product-group-full" == n && TSPOS.Model.Employee.isProductAddingAllowed()) {
            var s = $('<button class="btn-plus icon_plus"></button>');
            s.on("click", function() {
                TSPOS.Model.Products.addProductGroupAction()
            }), r.push(s)
        }
        if ($.each(t.subGroups, function(e, o) {
            if ((e <= a && "product-group" == n || e < i && "product-group-full" == n) && r.push(Pager.generateButton("product-group", o)), a == e && "product-group" == n) {
                var s = $('<button data-pager-open="product-group-full" class="btn-more">...</button>');
                s.data("product-group", t), r.push(s)
            }
        }), "product-group" == n) {
            /* BEGIN LAB EDIT */
            var l = TSPOS.Model.ProductGroup.data;
            var u = 4;
            var c = Pager.getPageMaxRecords(void 0, u);
            Pager.pageMax = Math.ceil(l.length / c), Pager.page > Pager.pageMax && (Pager.page = Pager.pageMax);
            var d = c * Pager.page - c, p = c * Pager.page;
            p > l.length && (p = l.length);
            var m = l.slice(d, p), f = [];
            $.each(m, function(e, t) {
                r.push(Pager.generateButton(Pager.groupOpen&&!Pager.subGroupsOpen ? "product-group" : r, t, e))
            })
            //l = $('<button class="btn-product-group"/>')
            //r.push(l);
            /* END LAB EDIT */
            /*var l = r.slice( - 1)[0];
            if (l || (l = $('<button class="btn-product-group"/>')), l)
                for (var u = l.attr("class"), c = $('<button class="' + u + '"/>'), d = r.length, p = 0; p < a - d + 2; p++)
                    r.push(c.clone())*/
        }
        if ("product-group-full" == n)
            return Pager.pageMax = Math.ceil(t.subGroups.length / i), Pager.subGroupsOpen=!0, Pager.insertAndExpand("product-group", r), void Pager.calculateGrid();
        var m = Pager.getPageMaxRecords(void 0, o), f = m - a - 2, h = {
            groupID: t.productGroupID,
            recordsOnPage: f,
            active: 1,
            includeMatrixVariations: 0
        };
        Pager.currentGroup.for_products = f, ErplyAPI.getProducts(h, function(e) {
            if (Pager.pageMax = Math.ceil(e.getRecordsTotal() / f), $.each(e.getRecords(), function(e, t) {
                r.push(Pager.generateButton("product", t))
            }), 0 == e.getRecordsInResponse()) {
                var t = $('<button class="btn-product"></button>');
                r.push(t)
            }
            Pager.insertAndExpand("product-group", r), Pager.calculateGrid()
        })
    }

    TSPOS.EventManager.addEventListener("display_customer_info", function(t,r) {
        $( "#customer-info-cardnumber").parent().remove();
        $( "#customer-info-code").parent().remove();
        $( "#customer-info-birthday").parent().remove();
        $( "#customer-info-email").parent().remove();
        $( "#customer-info-phone").parent().remove();
        $( "#add-customer-group").parent().parent().hide();

    });

    TSPOS.EventManager.addEventListener("display_customer_info_visible_after", function(t,r) {
        $( "#visible-customer-cardnumber").remove();
        $( "#add-customer-group").parent().parent().hide();
        toggleSpecialGroups();
    });

    setInterval(tick2, 1000);
    function tick2() {
        $( "#add-customer-cardnumber").parent().parent().hide();
        $( "#add-customer-group").parent().parent().hide();
    }

    // TSPOS.EventManager.addEventListener("view_loaded", function(t,r) {

    //     console.log("view_loaded",t,r)
    // });

    function toggleSpecialGroups() {


        var groupID = TSPOS.Model.Customer.customer.groupID;
        var customerID = TSPOS.Model.Customer.customer.customerID;

        if(groupID == 18 || groupID == 22) {
            $( "button:contains('Pubirallid')").hide();
            $( "button:contains('DJ')").hide();
            $( "button:contains('Mot')").show();
            $( "button:contains('Beerpong')").hide();
        } else {
            $( "button:contains('Pubirallid')").hide();
            $( "button:contains('DJ')").hide();
            $( "button:contains('Mot')").hide();
            $( "button:contains('Beerpong')").hide();
        }

        // DJ kliendid
        if(customerID == 2395 || customerID == 2396) {
            $( "button:contains('Pubirallid')").hide();
            $( "button:contains('DJ')").show();
            $( "button:contains('Mot')").hide();
            $( "button:contains('Beerpong')").hide();
        } else if(
            customerID == 1670 || // Backpackers OÜ
            customerID == 1644 || // Mofe OÜ
            customerID == 2478 // Creative Travel Agency
            ) 
        {
            $( "button:contains('Pubirallid')").show();
            $( "button:contains('DJ')").hide();
            $( "button:contains('Mot')").hide();
            $( "button:contains('Beerpong')").hide();
        } else if(customerID == 1642) {  // Beerpong OÜ
            $( "button:contains('Pubirallid')").hide();
            $( "button:contains('DJ')").hide();
            $( "button:contains('Mot')").hide();
            $( "button:contains('Beerpong')").show();
        }


    }

    TSPOS.EventManager.addEventListener("display_customer_info_visible_before", function(t,r) {

        // Kui ei ole Vana-Posti 8 ladu
        //if(TSPOS.Model.POS.warehouseID != 9) return false;
        //if(TSPOS.Model.POS.pointOfSaleID != 13) return false;

        var id = "idCardManualRead";
        var button = '<button id="' + id + '" class="btn input-lg" style="width:32%;margin-right:4px;background-color:#94d4ed">Loe ID-kaart</button>';
        var element = $("#"+id);
        if (element.length == 0) {
            el = $("div#visible-customer-information button.btn-profile").before(button);
            $("#"+id).click(function() {
                ErplyEPSI.websocket.send("request=readidcard&id=readidcard");
                return false;
            });
          $("div#visible-customer-information button.btn-customer-action").css("width","32%");

        }
    });

    /*TSPOS.EventManager.addEventListener("display_customer_info_visible_before", function(t,r) {

        // Kui ei ole Vana-Posti 8 ladu
        if(TSPOS.Model.POS.warehouseID != 9) return false;


        // See plugin lisab kolmapäeviti kliendi "VP8 Kolmapäev tudengid" kliendi valimise nupu kassasse
        var now = new Date();
        var day = now.getDay();
        var hour = now.getHours();
        if( (day==3 && hour > 18) || (day==4 && hour < 7)) {
            var id = "hogaeir7gao";
            var button = '<button id="' + id + '" class="btn input-lg" style="width:32%;margin-right:4px">Klient: VP8K</button>';
            var element = $("#"+id);
            if (element.length == 0) {
              el = $("div#visible-customer-information button.btn-profile").before(button);
              $("#"+id).click(function(){
                    TSPOS.Model.Customer.getAndSetCustomer(2498);
                    return false; }
                );
              $("div#visible-customer-information button.btn-customer-action").css("width","32%");
            }
        }
    });*/

    TSPOS.EventManager.addEventListener("grid_section_rendered", function(t,r) {
        $( "ul.app-header-nav li a#open-backoffice" ).parent().hide();
        $( "ul.app-header-nav li a[data-action='edit-mode']" ).parent().hide();
        $( "ul.app-header-nav li a[class*='icon_ul']").parent().hide();

        $( "a#release-notes-link").parent().hide();
        $( "a#help-link").parent().hide();
        $( "a#terms-of-service-link").parent().hide();

        $( "button:contains('ARHIIV')" ).hide();
        $( "button:contains('LAB PRODUCTION')" ).hide();

        $( "button:contains('BONUS')").css("background-color","#EEEE00");

        $( "button:contains('DJ')").css("background-color","#00EE00");
        $( "button:contains('Mot')").css("background-color","#00EE00");
        $( "button:contains('Pubirallid')").css("background-color","#00EE00");
        $( "button:contains('Beerpong')").css("background-color","#00EE00");

        $( ".btn-product .product-price:contains('4.50')").parent().css("background-color", "#a4cbda");
        $( ".btn-product .product-price:contains('5.00')").parent().css("background-color", "#bee4f4");

        $( ".modal-footer button.payment-card").css("background-color", "#EEEE00");
    

        toggleSpecialGroups();

        // Make this section for 1920x* Android only
        if(navigator.userAgent.indexOf('Android') !== -1) {
            wHeight = window.innerHeight
            wWidth = window.innerWidth
            $( ".ember-view .container").css("width", "80%");
            $( ".ember-view #col1").css("width", "36%");
            $( ".ember-view #col2").css("width", "64%");
            $( "#bill-scrollable").css("font-size", "130%")

            widthCol2 = $( ".ember-view #col2").width()
            heightCol2 = $( ".ember-view #col2").height()

            
            $( "#page-container div[data-page-type='product-group']").css("width", "100%");
            $( "#page-container .btn-home").css("width", "130px").css("height", "126px")
            $( "#page-container .btn-product-group").css("width", "130px").css("height", "126px").css("font-size", "170%")
            $( "#page-container .btn-product").css("width", "130px").css("height", "126px").css("font-size", "150%")
            $( "#page-container .btn-product .product-name").css("height", "60%")
            $( "#page-container .btn-action").css("width", "130px").css("height", "126px").css("font-size", "150%")
            $( "#page-container .btn-function").css("width", "130px").css("height", "126px").css("font-size", "150%")
            $( "#page-container .btn-function .icon-label").css("font-size", "20px")

            $( "#functions,#sale-options").css("width", "100%").css("height", "126px")
            $( "#functions,#sale-options").css("width", "100%").css("height", "126px")


            b1 = $( ".sub-page[data-rows='4'] .btn-product-group:not(:hidden,.btn-added-js)").length
            b2 = $( ".sub-page[data-rows='4'] .btn-product:not(.btn-added-js)").length

            rows = Math.ceil((b1+b2+1) / 7)
            buttonHeight = 126+8
            
            $(".sub-page[data-rows='4']").css("height", rows * buttonHeight)
        }
    });

});
