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
        },

        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
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

        onSave: function () {
            MessageToast.show("Data Saved");
        },

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

    // Excel Columns
    var aCols = [
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
}

    });
});