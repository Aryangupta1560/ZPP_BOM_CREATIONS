sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/Input",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, ValueHelpDialog, FilterBar, FilterGroupItem, Input, Filter, FilterOperator){
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
    var that = this;

    if (!this._oMatVHD) {
        // 1. Clean Filter Bar (No extra buttons)
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
            showFilterConfiguration: false, // ❌ "Filters" button hatane ke liye
            showGoOnFB: true,               // ✅ "Go" button dikhane ke liye
            filterBarExpanded: true,        // ✅ Hamesha khula rahega
            useToolbar: false,              // ❌ Extra toolbar hatane ke liye
            filterGroupItems: [
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "Product",
                    label: "Product",
                    visibleInFilterBar: true, // ✅ Direct dikhega
                    control: new sap.m.Input()
                }),
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "ProductDescription",
                    label: "Product Description",
                    visibleInFilterBar: true, // ✅ Direct dikhega
                    control: new sap.m.Input()
                })
            ],
            search: function () {
                var aFilters = [];
                var aItems = oFilterBar.getFilterGroupItems();

                aItems.forEach(function (oItem) {
                    var sValue = oItem.getControl().getValue();
                    if (sValue) {
                        aFilters.push(new sap.ui.model.Filter(
                            oItem.getName(),
                            sap.ui.model.FilterOperator.Contains,
                            sValue
                        ));
                    }
                });
                that._oTable.getBinding("items").filter(aFilters);
            }
        });

        // 2. Simplified Table (No Radio Buttons, Row Click Active)
        this._oTable = new sap.m.Table({
            growing: true,
            growingThreshold: 20,
            mode: "None", 
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Product" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Product Description" }) })
            ]
        });

        this._oTable.bindItems({
            path: "/ZI_MATERIAL_VH",
            template: new sap.m.ColumnListItem({
                type: "Active", 
                cells: [
                    new sap.m.Text({ text: "{Product}" }),
                    new sap.m.Text({ text: "{ProductDescription}" })
                ]
            })
        });

        // Row click selection logic
        this._oTable.attachItemPress(function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oData = oItem.getBindingContext().getObject();
            that.byId("inpMaterial3").setValue(oData.Product);
            that._oMatVHD.close();
        });

        // 3. Dialog Setup
        this._oMatVHD = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            title: "Select Material",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: true,
            ok: function () { that._oMatVHD.close(); },
            cancel: function () { that._oMatVHD.close(); }
        });

        this._oTable.setModel(this.getOwnerComponent().getModel());
        this._oMatVHD.setTable(this._oTable);
    }

    this._oMatVHD.open();
},

onMaterialValueHelp: function () {
    var that = this;

    if (!this._oMatVHD) {
        // --- 1. Filter Search Logic Function (Re-usable) ---
        var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();
            aItems.forEach(function (oItem) {
                var sValue = oItem.getControl().getValue();
                if (sValue) {
                    aFilters.push(new sap.ui.model.Filter(
                        oItem.getName(),
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ));
                }
            });
            that._oTable.getBinding("items").filter(aFilters);
        };

        // --- 2. Clean Filter Bar ---
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false, // ❌ Go button ki zaroorat nahi kyunki Enter kaam karega
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "Product",
                    label: "Product",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch // ✅ Enter dabane par filter chalega
                    })
                }),
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "ProductDescription",
                    label: "Product Description",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch // ✅ Enter dabane par filter chalega
                    })
                })
            ]
        });

        // --- 3. Table Setup ---
        this._oTable = new sap.m.Table({
            growing: true,
            growingThreshold: 1000,
            mode: "None", 
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Product" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Product Description" }) })
            ]
        });

        this._oTable.bindItems({
            path: "/ZI_MATERIAL_VH",
            template: new sap.m.ColumnListItem({
                type: "Active", 
                cells: [
                    new sap.m.Text({ text: "{Product}" }),
                    new sap.m.Text({ text: "{ProductDescription}" })
                ]
            })
        });

        this._oTable.attachItemPress(function (oEvent) {
            var oData = oEvent.getParameter("listItem").getBindingContext().getObject();
            that.byId("inpMaterial3").setValue(oData.Product);
            that._oMatVHD.close();
        });

        // --- 4. Dialog Setup (Chota Size) ---
        this._oMatVHD = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            title: "Select Material",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,            // ❌ Full screen band kiya
            contentWidth: "60%",       // ✅ Width kam ki
            contentHeight: "60%",      // ✅ Height kam ki
            ok: function () { that._oMatVHD.close(); },
            cancel: function () { that._oMatVHD.close(); }
        });

        this._oTable.setModel(this.getOwnerComponent().getModel());
        this._oMatVHD.setTable(this._oTable);
    }

    this._oMatVHD.open();
},

onPlantValueHelp: function () {
    var that = this;

    if (!this._oPlantVHD) {
        // --- 1. Filter Search Logic Function (Enter Key & Search Support) ---
        var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();
            aItems.forEach(function (oItem) {
                var sValue = oItem.getControl().getValue();
                if (sValue) {
                    aFilters.push(new sap.ui.model.Filter(
                        oItem.getName(),
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ));
                }
            });
            that._oPlantTable.getBinding("items").filter(aFilters);
        };

        // --- 2. Clean Filter Bar (With Enter Key Support) ---
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false, 
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "Plant", // Key Element from your VH
                    label: "Plant",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch // ✅ Enter dabane par filter chalega
                    })
                }),
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "PlantName", // Assuming this is the field name for Description
                    label: "Plant Name",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch // ✅ Enter dabane par filter chalega
                    })
                })
            ]
        });

        // --- 3. Table Setup (No Radio Buttons, Row Click Active) ---
        this._oPlantTable = new sap.m.Table({
            growing: true,
            growingThreshold: 20,
            mode: "None", 
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Plant" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Plant Name" }) })
            ]
        });

        this._oPlantTable.bindItems({
            path: "/ZI_plant_vh", // Aapki defined Entity
            template: new sap.m.ColumnListItem({
                type: "Active", 
                cells: [
                    new sap.m.Text({ text: "{Plant}" }),
                    new sap.m.Text({ text: "{PlantName}" }) 
                ]
            })
        });

        // Row click selection logic
        this._oPlantTable.attachItemPress(function (oEvent) {
            var oData = oEvent.getParameter("listItem").getBindingContext().getObject();
            that.byId("inpPlant3").setValue(oData.Plant); // ✅ Mapping to Plant field
            that._oPlantVHD.close();
        });

        // --- 4. Dialog Setup (Chota Size - 60% Width/Height) ---
        this._oPlantVHD = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            title: "Select Plant",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () { that._oPlantVHD.close(); },
            cancel: function () { that._oPlantVHD.close(); }
        });

        this._oPlantTable.setModel(this.getOwnerComponent().getModel());
        this._oPlantVHD.setTable(this._oPlantTable);
    }

    this._oPlantVHD.open();
}
    });
});