sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("zdatamanagerapp.controller.z_datamanagerapp_Master", {
        onInit() {
             this.getView().setModel(new sap.ui.model.json.JSONModel(), "selected");
        },
        viewMore: async function (oEvent)
        {
            const oContext = oEvent.getSource().getBindingContext();
            const sEmpId = oContext.getProperty("employeeID");
            const oView = this.getView();
            const oModel = oView.getModel();
            try
            {
                const oBinding = oModel.bindContext(`/EmployeesMoreInfo(${sEmpId})?$expand=basicInfo`);
                const oData = await oBinding.requestObject();
                if (oData)
                {
                    oView.getModel("selected").setData(oData);
                    const sHeader = `More Details of ${oData.basicInfo?.firstName || ""} ${oData.basicInfo?.lastName || ""}`;
                    oView.byId("_IDGenPanel").setHeaderText(sHeader);
                    oView.byId("_IDGenPanel").setVisible(true);
                }
                else
                {
                    sap.m.MessageToast.show("No additional information found.");
                }
            } 
            catch (err)
            {
                sap.m.MessageToast.show("Error fetching details.");
                console.error(err);
            }
        },
        closePanel:function()
        {
            const oView = this.getView();
            oView.byId("_IDGenPanel").setVisible(false);
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
                    salary: "",
                    jobTitle: "",
                    birthDate: "",
                    hireDate: "",
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
       onSaveEmployee: async function ()
       {

            const oModel = this.getView().getModel();

    try {
        const basicInfo = {
            employeeID: this.byId("_IDGenInput").getValue(),
            firstName: this.byId("_IDGenInput1").getValue(),
            lastName: this.byId("_IDGenInput2").getValue(),
            jobTitle: this.byId("_IDGenInput6").getValue()
        };
        const details = {
            gender: this.byId("_IDGenSelect").getSelectedKey(),
            email: this.byId("_IDGenInput3").getValue(),
            department: this.byId("_IDGenInput4").getValue(),
            employmentType: this.byId("_IDGenSelect1").getSelectedKey(),
            maritalStatus: this.byId("_IDGenSelect2").getSelectedKey(),
            salary: this.byId("_IDGenInput5").getValue(),
            birthDate: this.byId("_IDGenDatePicker").getValue(),
            hireDate: this.byId("_IDGenDatePicker1").getValue(),
            address: this.byId("_IDGenInput7").getValue(),
            city: this.byId("_IDGenInput8").getValue(),
            region: this.byId("_IDGenInput9").getValue(),
            postalCode: this.byId("_IDGenInput10").getValue(),
            country: this.byId("_IDGenInput11").getValue(),
            phoneNumber: this.byId("_IDGenInput12").getValue(),
            emergencyContactName: this.byId("_IDGenInput13").getValue(),
            emergencyContactPhone: this.byId("_IDGenInput14").getValue(),
            reportsTo: this.byId("_IDGenInput15").getValue()
        };

        console.log("Sending:", basicInfo, details);

        // CAP Action Call
        const result = await oModel.callAction("/addEmployee", {
            method: "POST",
            data: { basicInfo, details }
        });

        sap.m.MessageToast.show(result.message);

        this.oDialog.close();

    } catch (err)
    {
    const msg = err?.error?.message || err?.message || "Unexpected error";
    sap.m.MessageBox.error(msg);
    console.error(err);
}



}

    });
});