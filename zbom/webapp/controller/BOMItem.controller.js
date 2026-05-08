sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (Controller, History, MessageToast, MessageBox, Spreadsheet, exportLibrary) {
    "use strict";

    return Controller.extend("zbom.controller.BOMItem", {
        onInit: function () {
    var oModel = new sap.ui.model.json.JSONModel({ items: [] });
    this.getView().setModel(oModel);

    // Route match hone pe items pre-fill karo
    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.getRoute("RouteBOMItem").attachPatternMatched(this._onRouteMatched, this);
},

_onRouteMatched: function () {
    // Copy Items Model check karo
    var oCopyItemsModel = this.getOwnerComponent().getModel("copyItemsModel");

    if (oCopyItemsModel) {
        var aCopyItems = oCopyItemsModel.getProperty("/items");

        if (aCopyItems && aCopyItems.length > 0) {
            // Items table mein set karo
            var oModel = this.getView().getModel();
            oModel.setProperty("/items", aCopyItems);

            // Model clear karo — dobara na aaye
            this.getOwnerComponent().setModel(null, "copyItemsModel");
        }
    } else {
        // Fresh start — empty table
        var oViewModel = this.getView().getModel();
        oViewModel.setProperty("/items", []);
    }
},

        // onAddRow: function () {
        //     var oModel = this.getView().getModel();
        //     var aItems = oModel.getProperty("/items");
        //     aItems.push({ item: (aItems.length + 1) * 10, component: "", quantity: 1 });
        //     oModel.refresh();
        // },

        onAddRow: function () {
    var oModel = this.getView().getModel();
    var aItems = oModel.getProperty("/items");

    var iNextItem = 10;

    if (aItems.length > 0) {
        var iLastItem = aItems[aItems.length - 1].item;
        iNextItem = iLastItem + 10;
    }

    aItems.push({
        item: iNextItem,
        component: "",
        quantity: 1
    });

    oModel.refresh();
},

        // onSave: function () {
        //     MessageToast.show("Data Saved");
        // },

onDelete: function () {
    var oTable = this.byId("bomItemsTable");
    var oModel = this.getView().getModel();
    var aItems = oModel.getProperty("/items");

    var aSelectedItems = oTable.getSelectedItems();

    if (aSelectedItems.length === 0) {
        sap.m.MessageToast.show("Please select items to delete");
        return;
    }

    // Get indexes
    var aIndexesToDelete = aSelectedItems.map(function (oItem) {
        return oTable.indexOfItem(oItem);
    });

    // Sort descending
    aIndexesToDelete.sort(function (a, b) {
        return b - a;
    });

    // Delete
    aIndexesToDelete.forEach(function (iIndex) {
        aItems.splice(iIndex, 1);
    });

    // ✅ IMPORTANT: Re-number items
    aItems.forEach(function (oItem, index) {
        oItem.item = (index + 1) * 10;
    });

    oModel.refresh();
    oTable.removeSelections();

    sap.m.MessageToast.show("Selected items deleted");
},

onSelectAll: function () {
    var oTable = this.byId("bomItemsTable");

    // Select all rows
    oTable.selectAll();

    sap.m.MessageToast.show("All items selected");
},

onCancel: function () {
    var that = this;

    MessageBox.warning("Are you sure you want to cancel? All data will be lost.", {
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.OK,

        onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {

                // ✅ Clear table model
                var oModel = that.getView().getModel();
                oModel.setProperty("/items", []);

                // ✅ Clear header model (important)
                that.getOwnerComponent().setModel(null, "headerModel");

                // ✅ Navigate to first page (hard reset)
                that.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        }
    });
},

onExportExcel: function () {
    var oTable = this.byId("bomItemsTable");
    var oModel = this.getView().getModel();
    var aItems = oModel.getProperty("/items");

    var aSelectedItems = oTable.getSelectedItems();

    if (aSelectedItems.length === 0) {
        MessageToast.show("Please select items to export");
        return;
    }

    // Get selected data
    var aExportData = aSelectedItems.map(function (oItem) {
        var oContext = oItem.getBindingContext();
        return oContext.getObject();
    });

// ✅ Get Header Data
    var oHeader = this.getOwnerComponent().getModel("headerModel").getData();

        // ✅ Add header info inside each row (important trick)
    aExportData = aExportData.map(function (oItem) {
        return {
            Material: oHeader.Material,
            Plant: oHeader.Plant,
            AltBom: oHeader.AltBom || "",
            item: oItem.item,
            component: oItem.component,
            description: oItem.description,
            quantity: oItem.quantity,
            uom: oItem.uom,
            sortString: oItem.sortString,
            category: oItem.category,
            itemText: oItem.itemText
        };
    });

    // Excel Columns
    var aCols = [
        { label: "Material", property: "Material" },
        { label: "Plant", property: "Plant" },
        { label: "Alternative BOM", property: "AltBom" },
        { label: "Item", property: "item" },
        { label: "Component", property: "component" },
        { label: "Description", property: "description" },
        { label: "Quantity", property: "quantity" },
        { label: "UoM", property: "uom" },
        { label: "Sort String", property: "sortString" },
        { label: "Category", property: "category" },
        { label: "Item Text", property: "itemText" }
    ];

    var oSettings = {
        workbook: {
            columns: aCols
        },
        dataSource: aExportData,
        fileName: "BOM_Items.xlsx"
    };

    var oSpreadsheet = new Spreadsheet(oSettings);
    oSpreadsheet.build().then(function () {
        MessageToast.show("Excel downloaded");
    });
},

onUomValueHelp: function (oEvent) {
    var that = this;

    // Get clicked row context
    var oInput = oEvent.getSource();
    this._oCurrentContext = oInput.getBindingContext();

    if (!this._oUomVHD) {

        // --- Filter Search ---
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

            that._oUomTable.getBinding("items").filter(aFilters);
        };

        // --- Filter Bar ---
        var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "UnitOfMeasure",
                    label: "UoM",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch
                    })
                }),
                new sap.ui.comp.filterbar.FilterGroupItem({
                    groupName: "basic",
                    name: "UnitOfMeasure_Text",
                    label: "Description",
                    visibleInFilterBar: true,
                    control: new sap.m.Input({
                        submit: fnDoSearch
                    })
                })
            ]
        });

        // --- Table ---
        this._oUomTable = new sap.m.Table({
            growing: true,
            growingThreshold: 500,
            mode: "None",
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "UoM" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) })
            ]
        });

        this._oUomTable.bindItems({
            path: "/I_UnitOfMeasure",
            template: new sap.m.ColumnListItem({
                type: "Active",
                cells: [
                    new sap.m.Text({ text: "{UnitOfMeasure}" }),
                    new sap.m.Text({ text: "{UnitOfMeasure_Text}" })
                ]
            })
        });

        // --- Row Click Selection ---
        this._oUomTable.attachItemPress(function (oEvent) {
            var oData = oEvent.getParameter("listItem").getBindingContext().getObject();

            that._oCurrentContext.getModel().setProperty(
                that._oCurrentContext.getPath() + "/uom",
                oData.UnitOfMeasure
            );

            that._oUomVHD.close();
        });

        // --- Dialog ---
        this._oUomVHD = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            title: "Select UoM",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () { that._oUomVHD.close(); },
            cancel: function () { that._oUomVHD.close(); }
        });

        this._oUomTable.setModel(this.getOwnerComponent().getModel());
        this._oUomVHD.setTable(this._oUomTable);
    }

    this._oUomVHD.open();
},

onSave: function () {

    var that = this;
    var oModel = this.getOwnerComponent().getModel();
    var oHeader = this.getOwnerComponent().getModel("headerModel").getData();
    var aItems = this.getView().getModel().getProperty("/items");

    if (!aItems || aItems.length === 0) {
        sap.m.MessageToast.show("Add at least one item");
        return;
    }

    // 🔹 Sirf header bhejo — to_Item nahi
    // save_modified backend pe items copy karega
    var oPayload = {
        Material: oHeader.Material,
        Plant: oHeader.Plant,
        BomUsage: oHeader.BomUsage || "1",
        CopyMaterial: oHeader.CopyMaterial || "",
        CopyPlant: oHeader.CopyPlant || "",
        CopyAltBom: oHeader.CopyAltBom || ""
        // ← to_Item bilkul mat bhejo
    };

    // ✅ Agar Copy From nahi bhara — to_Item bhejo
if (!oHeader.CopyMaterial || !oHeader.CopyPlant || !oHeader.CopyAltBom) {
    oPayload.to_Item = {
        results: aItems.map(function (oItem) {
            return {
                Component: oItem.component || "",
                Quantity: oItem.quantity ? oItem.quantity.toString() : "0",
                Uom: oItem.uom || "",
                SortString: oItem.sortString || "",
                ItemText: oItem.itemText || "",
                ItemCategory: oItem.category || "L"
            };
        })
    };
}

    oModel.create("/ZC_BOM_HEADER", oPayload, {
        success: function (oResponse) {
            var iAltBom = oResponse.AltBom;

            var oHeaderModel = that.getOwnerComponent().getModel("headerModel");
            oHeaderModel.setProperty("/AltBom", iAltBom);

            sap.m.MessageBox.success(
                "BOM Created Successfully!\n" +
                "Material: " + oResponse.Material + "\n" +
                "Plant: " + oResponse.Plant + "\n" +
                "Alternative BOM: " + iAltBom,
                {
                    onClose: function () {
                        that.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
                    }
                }
            );
        },
        error: function (oError) {
            var sMessage = "Error while saving BOM.";
            try {
                var oErrorBody = JSON.parse(oError.responseText);
                if (oErrorBody.error && oErrorBody.error.message) {
                    sMessage = oErrorBody.error.message.value;
                }
            } catch (e) {}
            sap.m.MessageBox.error(sMessage);
        }
    });
}


    });
});