sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
], function (Controller, MessageToast, ValueHelpDialog) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {
        onContinue: function () {
            var sMat = this.byId("inpMaterial3").getValue();
            var sPlant = this.byId("inpPlant3").getValue();

            if (!sMat || !sPlant) {
                MessageToast.show("Please fill required fields.");
                return;
            }

// ✅ Create JSON model and store data
    var oHeaderData = {
        Material: sMat,
        Plant: sPlant,
        // Usage: sUsage
    };

var oModel = new sap.ui.model.json.JSONModel(oHeaderData);
    this.getOwnerComponent().setModel(oModel, "headerModel");

            this.getOwnerComponent().getRouter().navTo("RouteBOMItem");
        },

           onInit: function () {
    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
},

_onRouteMatched: function () {
    this._resetForm();
},

_resetForm: function () {
    this.byId("inpMaterial3").setValue("");
    this.byId("inpPlant3").setValue("");
    this.byId("inpBomUsage3").setValue("");
    this.byId("inpCopyMaterial3").setValue("");
    this.byId("inpCopyPlant3").setValue("");
    this.byId("inpCopyAltBom3").setValue("");
},

onCancel: function () {
    this._resetForm();
    sap.m.MessageToast.show("Form cleared");
},

onBomUsageValueHelp: function () {
    var that = this;

    var aData = [
        { Usage: "1", UsageText: "Production" },
        { Usage: "2", UsageText: "Engineering/Design" },
        { Usage: "3", UsageText: "Universal" },
        { Usage: "4", UsageText: "Plant Maintenance" },
        { Usage: "5", UsageText: "Sales and Distribution" },
        { Usage: "P", UsageText: "Predictive MRP" },
        { Usage: "S", UsageText: "Service Management" }
    ];

    var oModel = new sap.ui.model.json.JSONModel(aData);

    // Create dialog once
    if (!this._oVHD) {
        this._oVHD = new ValueHelpDialog({
            title: "Select BOM Usage",
            supportMultiselect: false,
            supportRanges: false,
            key: "Usage",
            descriptionKey: "UsageText",

            ok: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                if (aTokens.length > 0) {
                    that.byId("inpBomUsage3")
                        .setValue(aTokens[0].getKey()); // ✅ ONLY VALUE (1,2)
                }
                that._oVHD.close();
            },

            cancel: function () {
                that._oVHD.close();
            }
        });

        // Create Table inside dialog
        var oTable = new sap.m.Table({
            columns: [
                new sap.m.Column({
                    header: new sap.m.Label({ text: "Usage" })
                }),
                new sap.m.Column({
                    header: new sap.m.Label({ text: "Usage Text" })
                })
            ]
        });

        oTable.bindItems({
            path: "/",
            template: new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({ text: "{Usage}" }),
                    new sap.m.Text({ text: "{UsageText}" })
                ]
            })
        });

        oTable.setMode("SingleSelectMaster");
        oTable.setIncludeItemInSelection(true);


oTable.attachSelectionChange(function (oEvent) {
    var oItem = oEvent.getParameter("listItem");
    var oData = oItem.getBindingContext().getObject();

    that.byId("inpBomUsage3").setValue(oData.Usage); // only 1,2,3

    that._oVHD.close(); // close dialog
});

        this._oVHD.setTable(oTable);
        this._oVHD.setModel(oModel);
    }

    this._oVHD.open();
},



        onMaterialValueHelp: function () {
            MessageToast.show("Value Help Requested");
        },

        onPlantValueHelp: function () {
            MessageToast.show("Value Help Requested");
        }
    });
});