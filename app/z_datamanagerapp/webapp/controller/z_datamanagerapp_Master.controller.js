sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";
    return Controller.extend("zdatamanagerapp.controller.z_datamanagerapp_Master", {
        onInit() {
             this.getView().setModel(new sap.ui.model.json.JSONModel(), "selected");
        },
        onAdd:function ()
        {
            const oView = this.getView();
            const oData = {
                basicInfo: {
                    employeeID: "",
                    firstName: "",
                    lastName: "",
                    jobTitle: ""
                },
                details: {
                    gender: "",
                    email: "",
                    department: "",
                    employmentType: "",
                    maritalStatus: "",
                    salary: null,
                    birthDate: null,
                    hireDate: null,
                    address: "",
                    city: "",
                    region: "",
                    postalCode: "",
                    country: "",
                    phoneNumber: "",
                    emergencyContactName: "",
                    emergencyContactPhone: "",
                    reportsTo: ""
                }
            };
            const oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel, "emp");
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "zdatamanagerapp.view.z_datamanagerapp_dataCollector",
                    this
                );
                oView.addDependent(this.oDialog);
            }
            this.oDialog.open();
        },
        onSaveEmployee: async function ()
        {
            const oModel = this.getView().getModel("emp");
            const basicInfo = oModel.getProperty("/basicInfo");
            const details = oModel.getProperty("/details");

            try
            {
                if (!basicInfo.employeeID || !basicInfo.firstName || !basicInfo.lastName)
                {
                    return sap.m.MessageBox.error("EmployeeID, First Name, and Last Name are mandatory.");
                }
                const response = await fetch("/odata/v4/z-service-employee-info/addEmployee", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ basicInfo, details })
                });

                if (!response.ok)
                {
                    let msg = `Failed to add employee. Status: ${response.status}`;
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json"))
                    {
                        const errData = await response.json();
                        msg = errData.error?.message || msg;
                    }
                    throw new Error(msg);
                }
                const result = await response.json();
                sap.m.MessageToast.show(result.value || result.message || "Employee added successfully");
                if (this.oDialog) this.oDialog.close();

            } 
            catch (err)
            {
                sap.m.MessageBox.error(err.message);
                console.error(err);
            }
        },
        onCancelDialog:function()
        {
            console.log("Closed");
            if (this.oDialog)
            {
                this.oDialog.close();
                sap.m.MessageToast.show("closed");
            }
            else
            {
                console.error("Dialog instance is not created");
            }
        },
        onEdit:function()
        {
            //Edit at Table
        },
        onDelete:function()
        {
            //Delete
        },
        onRefresh:function()
        {
            var oModel = this.getView().getModel();
            var oTable = this.byId("_IDGenTable");
            var oPanel = this.byId("_IDGenPanel");
            if (oModel && oModel.refresh)
            {
                oModel.refresh();
            }
            oTable.removeSelections(true);
            var oSelectedModel = this.getView().getModel("selected");
            oSelectedModel.setData({});
            oPanel.setVisible(false);
            this.selectedEmployeeID = null;
            sap.m.MessageToast.show("Data refreshed successfully");
        },
        onSelect: async function (oEvent)
        {
            const oSelectedItem = oEvent.getParameter("listItem");
            const oCtx = oSelectedItem.getBindingContext();
            const sEmpId = oCtx.getProperty("employeeID");
            const oModel = this.getView().getModel();
            try
            {
                const oBinding = oModel.bindContext(`/EmployeeBasicInfo(${sEmpId})?$expand=moreInfo`);
                const oData = await oBinding.requestObject();
                if (oData && oData.moreInfo)
                {
                    const oSelected = new sap.ui.model.json.JSONModel(oData.moreInfo);
                    this.getView().setModel(oSelected, "selected");
                    const sHeader = `More Details of ${oData.firstName} ${oData.lastName}`;
                    this.getView().byId("_IDGenPanel").setHeaderText(sHeader);
                    this.getView().byId("_IDGenPanel").setVisible(true);
                } 
                else
                {
                    sap.m.MessageToast.show("No MoreInfo data found.");
                }

            }
            catch (err)
            {
                console.error(err);
                sap.m.MessageToast.show("Error while fetching details.");
            }
        },
        onEditPanelData:function()
        {
            //Edit at the Panel level Data
        },
        closePanel:function()
        {
            const oView = this.getView();
            oView.byId("_IDGenPanel").setVisible(false);
        }
    });
});