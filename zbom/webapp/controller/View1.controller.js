sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/Input",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    MessageToast,
    ValueHelpDialog,
    FilterBar,
    FilterGroupItem,
    Input,
    Filter,
    FilterOperator,
  ) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {
onContinue: function () {
    var that = this;

    var sMatDisplay = this.byId("inpMaterial3").getValue();
    var sMat = this._oSelectedMaterial && this._oSelectedMaterial.Product
        ? this._oSelectedMaterial.Product
        : sMatDisplay;

    var sPlantDisplay = this.byId("inpPlant3").getValue();
    var sPlant = this._oSelectedPlant && this._oSelectedPlant.Plant
        ? this._oSelectedPlant.Plant
        : sPlantDisplay;

    var sBomUsageDisplay = this.byId("inpBomUsage3").getValue();
    var sBomUsage = this._oSelectedBomUsage && this._oSelectedBomUsage.Usage
        ? this._oSelectedBomUsage.Usage
        : sBomUsageDisplay;

    if (!sMatDisplay || !sPlantDisplay || !sBomUsageDisplay) {
        MessageToast.show("Please fill all required fields.");
        return;
    }

    var oODataModel = this.getOwnerComponent().getModel();

    // Step 1 — Validate Material + Plant
    oODataModel.read("/ZI_MATERIAL_PLANT_VH", {
        filters: [
            new Filter("Material", FilterOperator.EQ, sMat),
            new Filter("Plant", FilterOperator.EQ, sPlant)
        ],
        success: function (oData) {

            if (!oData.results || oData.results.length === 0) {
                sap.m.MessageBox.error(
                    "Material " + sMat + " does not exist in Plant " + sPlant
                );
                return;
            }

            // Step 2 — AltBom calculate karo
            oODataModel.read("/ZC_BOM_HEADER", {
                filters: [
                    new Filter("Material", FilterOperator.EQ, sMat),
                    new Filter("Plant", FilterOperator.EQ, sPlant)
                ],
                success: function (oBomData) {

                    var iMaxAltBom = 0;
                    if (oBomData.results && oBomData.results.length > 0) {
                        oBomData.results.forEach(function (oBom) {
                            var iAlt = parseInt(oBom.AltBom, 10);
                            if (iAlt > iMaxAltBom) {
                                iMaxAltBom = iAlt;
                            }
                        });
                    }
                    var iNewAltBom = iMaxAltBom + 1;

                    // Step 3 — Copy From values lo
                    var sCopyMat = that._oSelectedCopyMaterial
                        ? that._oSelectedCopyMaterial.Product
                        : that.byId("inpCopyMaterial3").getValue();

                    var sCopyPlant = that._oSelectedCopyPlant
                        ? that._oSelectedCopyPlant.Plant
                        : that.byId("inpCopyPlant3").getValue();

                    var sCopyAltBom = that.byId("inpCopyAltBom3").getValue();

                    // Step 4 — Header Model set karo
                    var oHeaderData = {
                        Material: sMat,
                        Plant: sPlant,
                        Usage: sBomUsage,
                        BomUsage: sBomUsage,
                        AltBom: iNewAltBom,
                        BomUsageText: that._oSelectedBomUsage && that._oSelectedBomUsage.UsageText
                            ? that._oSelectedBomUsage.UsageText
                            : sBomUsageDisplay,
                        MaterialDescription: that._oSelectedMaterial && that._oSelectedMaterial.ProductDescription
                            ? that._oSelectedMaterial.ProductDescription
                            : sMatDisplay,
                        PlantDescription: that._oSelectedPlant && that._oSelectedPlant.PlantName
                            ? that._oSelectedPlant.PlantName
                            : sPlantDisplay,
                        CopyMaterial: sCopyMat,
                        CopyPlant: sCopyPlant,
                        CopyAltBom: sCopyAltBom
                    };

                    var oModel = new sap.ui.model.json.JSONModel(oHeaderData);
                    that.getOwnerComponent().setModel(oModel, "headerModel");

                    // Step 5 — Copy From items fetch karo
                    if (sCopyMat && sCopyPlant && sCopyAltBom) {

                        // Pehle source BOM ID dhundo
                        oODataModel.read("/ZC_BOM_HEADER", {
                            filters: [
                                new Filter("Material", FilterOperator.EQ, sCopyMat),
                                new Filter("Plant", FilterOperator.EQ, sCopyPlant),
                                new Filter("AltBom", FilterOperator.EQ, sCopyAltBom)
                            ],
                            success: function (oCopyBomData) {

                                if (!oCopyBomData.results || oCopyBomData.results.length === 0) {
                                    // Source BOM nahi mila — empty table ke saath navigate
                                    that.getOwnerComponent().getRouter().navTo("RouteBOMItem");
                                    return;
                                }

                                var sCopyBomId = oCopyBomData.results[0].BomId;

                                // Source BOM ke items fetch karo
                                oODataModel.read("/ZC_BOM_HEADER(guid'" + sCopyBomId + "')/to_Item", {
                                    success: function (oItemsData) {

                                        var aItems = [];
                                        if (oItemsData.results && oItemsData.results.length > 0) {
                                            var iItemNo = 10;
                                            oItemsData.results.forEach(function (oItem) {
                                                aItems.push({
                                                    item: iItemNo,
                                                    component: oItem.Component || "",
                                                    description: oItem.MaterialDesc || "",
                                                    quantity: oItem.Quantity || 1,
                                                    uom: oItem.Uom || "",
                                                    sortString: oItem.SortString || "",
                                                    category: oItem.ItemCategory || "L",
                                                    itemText: oItem.ItemText || ""
                                                });
                                                iItemNo += 10;
                                            });
                                        }

                                        // Items model set karo
                                        var oItemModel = new sap.ui.model.json.JSONModel({ items: aItems });
                                        that.getOwnerComponent().setModel(oItemModel, "copyItemsModel");

                                        // Navigate
                                        that.getOwnerComponent().getRouter().navTo("RouteBOMItem");
                                    },
                                    error: function () {
                                        // Items fetch nahi hue — empty ke saath navigate
                                        that.getOwnerComponent().getRouter().navTo("RouteBOMItem");
                                    }
                                });
                            },
                            error: function () {
                                that.getOwnerComponent().getRouter().navTo("RouteBOMItem");
                            }
                        });

                    } else {
                        // Copy From nahi bhara — directly navigate
                        that.getOwnerComponent().getRouter().navTo("RouteBOMItem");
                    }
                },
                error: function () {
                    sap.m.MessageBox.error("Error fetching BOM data.");
                }
            });
        },
        error: function () {
            sap.m.MessageBox.error("Error validating Material + Plant combination.");
        }
    });
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
          { Usage: "S", UsageText: "Service Management" },
        ];

        var oModel = new sap.ui.model.json.JSONModel(aData);

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
                var sUsageKey = aTokens[0].getKey();
                var oSelected = aData.find(function (oItem) {
                  return oItem.Usage === sUsageKey;
                });

                that._oSelectedBomUsage = {
                  Usage: sUsageKey,
                  UsageText: oSelected ? oSelected.UsageText : sUsageKey,
                };

                that
                  .byId("inpBomUsage3")
                  .setValue(that._oSelectedBomUsage.UsageText);
              }
              that._oVHD.close();
            },

            cancel: function () {
              that._oVHD.close();
            },
          });

          var oTable = new sap.m.Table({
            columns: [
              new sap.m.Column({
                header: new sap.m.Label({ text: "Usage" }),
              }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Usage Text" }),
              }),
            ],
          });

          oTable.bindItems({
            path: "/",
            template: new sap.m.ColumnListItem({
              cells: [
                new sap.m.Text({ text: "{Usage}" }),
                new sap.m.Text({ text: "{UsageText}" }),
              ],
            }),
          });

          oTable.setMode("SingleSelectMaster");
          oTable.setIncludeItemInSelection(true);

          oTable.attachSelectionChange(function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oData = oItem.getBindingContext().getObject();

            that._oSelectedBomUsage = {
              Usage: oData.Usage,
              UsageText: oData.UsageText,
            };
            that.byId("inpBomUsage3").setValue(oData.UsageText || oData.Usage);

            that._oVHD.close();
          });

          this._oVHD.setTable(oTable);
          this._oVHD.setModel(oModel);
        }

        this._oVHD.open();
      },

      onMaterialValueHelp: function () {
        var that = this;
        var oFilterBar;

        if (!this._oMatVHD) {
          var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();

            aItems.forEach(function (oItem) {
              var sValue = oItem.getControl().getValue();
              if (sValue) {
                aFilters.push(
                  new Filter(oItem.getName(), FilterOperator.Contains, sValue),
                );
              }
            });

            that._oTable.getBinding("items").filter(aFilters);
          };

          oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
              new FilterGroupItem({
                groupName: "basic",
                name: "Product",
                label: "Product",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
              new FilterGroupItem({
                groupName: "basic",
                name: "ProductDescription",
                label: "Product Description",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
            ],
          });

          this._oTable = new sap.m.Table({
            growing: true,
            growingThreshold: 1000,
            mode: "None",
            columns: [
              new sap.m.Column({
                header: new sap.m.Label({ text: "Product" }),
              }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Product Description" }),
              }),
            ],
          });

          this._oTable.bindItems({
            path: "/ZI_MATERIAL_VH",
            template: new sap.m.ColumnListItem({
              type: "Active",
              cells: [
                new sap.m.Text({ text: "{Product}" }),
                new sap.m.Text({ text: "{ProductDescription}" }),
              ],
            }),
          });

          this._oTable.attachItemPress(function (oEvent) {
            var oData = oEvent
              .getParameter("listItem")
              .getBindingContext()
              .getObject();

            that._oSelectedMaterial = {
              Product: oData.Product,
              ProductDescription: oData.ProductDescription,
            };
            that
              .byId("inpMaterial3")
              .setValue(oData.ProductDescription || oData.Product);
            that._oMatVHD.close();
          });

          this._oMatVHD = new ValueHelpDialog({
            title: "Select Material",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () {
              that._oMatVHD.close();
            },
            cancel: function () {
              that._oMatVHD.close();
            },
          });

          this._oTable.setModel(this.getOwnerComponent().getModel());
          this._oMatVHD.setTable(this._oTable);
        }

        this._oMatVHD.open();
      },

      onPlantValueHelp: function () {
        var that = this;
        var oFilterBar;

        if (!this._oPlantVHD) {
          var fnDoSearch = function () {
            var aFilters = [];
            var aItems = oFilterBar.getFilterGroupItems();

            aItems.forEach(function (oItem) {
              var sValue = oItem.getControl().getValue();
              if (sValue) {
                aFilters.push(
                  new Filter(oItem.getName(), FilterOperator.Contains, sValue),
                );
              }
            });

            that._oPlantTable.getBinding("items").filter(aFilters);
          };

          oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
              new FilterGroupItem({
                groupName: "basic",
                name: "Plant",
                label: "Plant",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
              new FilterGroupItem({
                groupName: "basic",
                name: "PlantName",
                label: "Plant Name",
                visibleInFilterBar: true,
                control: new Input({
                  submit: fnDoSearch,
                }),
              }),
            ],
          });

          this._oPlantTable = new sap.m.Table({
            growing: true,
            growingThreshold: 20,
            mode: "None",
            columns: [
              new sap.m.Column({ header: new sap.m.Label({ text: "Plant" }) }),
              new sap.m.Column({
                header: new sap.m.Label({ text: "Plant Name" }),
              }),
            ],
          });

          this._oPlantTable.bindItems({
            path: "/ZI_plant_vh",
            template: new sap.m.ColumnListItem({
              type: "Active",
              cells: [
                new sap.m.Text({ text: "{Plant}" }),
                new sap.m.Text({ text: "{PlantName}" }),
              ],
            }),
          });

          this._oPlantTable.attachItemPress(function (oEvent) {
            var oData = oEvent
              .getParameter("listItem")
              .getBindingContext()
              .getObject();

            that._oSelectedPlant = {
              Plant: oData.Plant,
              PlantName: oData.PlantName,
            };
            that.byId("inpPlant3").setValue(oData.PlantName || oData.Plant);
            that._oPlantVHD.close();
          });

          this._oPlantVHD = new ValueHelpDialog({
            title: "Select Plant",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () {
              that._oPlantVHD.close();
            },
            cancel: function () {
              that._oPlantVHD.close();
            },
          });

          this._oPlantTable.setModel(this.getOwnerComponent().getModel());
          this._oPlantVHD.setTable(this._oPlantTable);
        }

        this._oPlantVHD.open();
      },


      onCopyMaterialValueHelp: function () {
    var that = this;
    var oFilterBar;

    if (!this._oCopyMatVHD) {

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
            that._oCopyMatTable.getBinding("items").filter(aFilters);
        };

        oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
                new FilterGroupItem({
                    groupName: "basic",
                    name: "Product",
                    label: "Product",
                    visibleInFilterBar: true,
                    control: new Input({ submit: fnDoSearch })
                }),
                new FilterGroupItem({
                    groupName: "basic",
                    name: "ProductDescription",
                    label: "Product Description",
                    visibleInFilterBar: true,
                    control: new Input({ submit: fnDoSearch })
                })
            ]
        });

        this._oCopyMatTable = new sap.m.Table({
            growing: true,
            growingThreshold: 100,
            mode: "None",
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Product" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) })
            ]
        });

        this._oCopyMatTable.bindItems({
            path: "/ZI_MATERIAL_VH",
            template: new sap.m.ColumnListItem({
                type: "Active",
                cells: [
                    new sap.m.Text({ text: "{Product}" }),
                    new sap.m.Text({ text: "{ProductDescription}" })
                ]
            })
        });

        this._oCopyMatTable.attachItemPress(function (oEvent) {
            var oData = oEvent.getParameter("listItem")
                .getBindingContext().getObject();

            that._oSelectedCopyMaterial = {
                Product: oData.Product,
                ProductDescription: oData.ProductDescription
            };

            // Input mein Product code dikhao (description nahi)
            that.byId("inpCopyMaterial3").setValue(oData.Product);
            that._oCopyMatVHD.close();
        });

        this._oCopyMatVHD = new ValueHelpDialog({
            title: "Select Copy Material",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () { that._oCopyMatVHD.close(); },
            cancel: function () { that._oCopyMatVHD.close(); }
        });

        this._oCopyMatTable.setModel(this.getOwnerComponent().getModel());
        this._oCopyMatVHD.setTable(this._oCopyMatTable);
    }

    this._oCopyMatVHD.open();
},

onCopyPlantValueHelp: function () {
    var that = this;
    var oFilterBar;

    if (!this._oCopyPlantVHD) {

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
            that._oCopyPlantTable.getBinding("items").filter(aFilters);
        };

        oFilterBar = new FilterBar({
            showFilterConfiguration: false,
            showGoOnFB: false,
            filterBarExpanded: true,
            useToolbar: false,
            filterGroupItems: [
                new FilterGroupItem({
                    groupName: "basic",
                    name: "Plant",
                    label: "Plant",
                    visibleInFilterBar: true,
                    control: new Input({ submit: fnDoSearch })
                }),
                new FilterGroupItem({
                    groupName: "basic",
                    name: "PlantName",
                    label: "Plant Name",
                    visibleInFilterBar: true,
                    control: new Input({ submit: fnDoSearch })
                })
            ]
        });

        this._oCopyPlantTable = new sap.m.Table({
            growing: true,
            growingThreshold: 20,
            mode: "None",
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Plant" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Plant Name" }) })
            ]
        });

        this._oCopyPlantTable.bindItems({
            path: "/ZI_plant_vh",
            template: new sap.m.ColumnListItem({
                type: "Active",
                cells: [
                    new sap.m.Text({ text: "{Plant}" }),
                    new sap.m.Text({ text: "{PlantName}" })
                ]
            })
        });

        this._oCopyPlantTable.attachItemPress(function (oEvent) {
            var oData = oEvent.getParameter("listItem")
                .getBindingContext().getObject();

            that._oSelectedCopyPlant = {
                Plant: oData.Plant,
                PlantName: oData.PlantName
            };

            that.byId("inpCopyPlant3").setValue(oData.Plant);
            that._oCopyPlantVHD.close();
        });

        this._oCopyPlantVHD = new ValueHelpDialog({
            title: "Select Copy Plant",
            supportMultiselect: false,
            filterBar: oFilterBar,
            stretch: false,
            contentWidth: "60%",
            contentHeight: "60%",
            ok: function () { that._oCopyPlantVHD.close(); },
            cancel: function () { that._oCopyPlantVHD.close(); }
        });

        this._oCopyPlantTable.setModel(this.getOwnerComponent().getModel());
        this._oCopyPlantVHD.setTable(this._oCopyPlantTable);
    }

    this._oCopyPlantVHD.open();
},
    });
  },
);
