sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Messaging",
	"sap/fe/core/controllerextensions/MessageHandler",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"

], function (ControllerExtension, Filter, FilterOperator, Messaging, MessageHandler, JSONModel, MessageToast) {
	'use strict';

	return ControllerExtension.extend('fluidra.qm.managehu.managehandlinguints.ext.controller.ListReportExt', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf fluidra.qm.managehu.managehandlinguints.ext.controller.ListReportExt
			 */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				this._Controller = this.base.getExtensionAPI()._controller;
				this._ExtAPI = this.base.getExtensionAPI();
				this._oListTable = this.getView().byId("fluidra.qm.managehu.managehandlinguints::ManageHandlingUnitsList--fe::table::ManageHandlingUnits::LineItem::Table");
				this._oListTable.attachSelectionChange(this.onRowSelection, this);
				this._InspTypCngDtTime = [];
				var oJdata = { enablePostUD: false };

				this.getView().setModel(new JSONModel(oJdata), "settingsModel");


			}
		},
		onRecordUD: function (oEvent) {
			var oInspLotModel = this._ExtAPI.getModel("InspectionLot");
			oInspLotModel.mMessages = {};
			var oTable = sap.ui.getCore().byId("table0");
			var oItemSelectedContext = oTable.getSelectedItem().getBindingContext().getObject();
			var aDeferredGroups = oInspLotModel.getDeferredGroups();
			var sBatchGroup = "inspectionLotBatchGroup";
			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.removeAllMessages();
			var oData = [];
			oInspLotModel.resetChanges();

			if (!aDeferredGroups.includes(sBatchGroup)) {
				oInspLotModel.setDeferredGroups(aDeferredGroups.concat([sBatchGroup]));
			}


			this._InspTypCngDtTime.forEach((element, index) => {

				var oPayload = {
					"InspectionLot": element.InspectionLot,
					"InspLotUsageDecisionLevel": "L",
					"InspectionLotQualityScore": "100",
					"InspLotUsageDecisionCatalog": "3",
					"SelectedCodeSetPlant": oItemSelectedContext.SelectedCodeSetPlant,
					"InspLotUsgeDcsnSelectedSet": oItemSelectedContext.SelectedCodeSet,
					"InspLotUsageDecisionCodeGroup": oItemSelectedContext.UsageDecisionCodeGroup,
					"InspectionLotUsageDecisionCode": oItemSelectedContext.UsageDecisionCode,
					"ChangedDateTime": element.ChangedDateTime

				}

				oInspLotModel.createEntry("/A_InspLotUsageDecision", {
					groupId: sBatchGroup,
					properties: oPayload,
					changeSetId: "changeSet" + index
				});

			});

			var fnFunction = function (othis) {
				return new Promise(function (fnResolve, fnReject) {

					var that = othis;
					oInspLotModel.submitChanges({
						refreshAfterChange: false,
						success: function (oData, oResponse) {
							var oInspModel = that._ExtAPI.getModel("InspectionLot"),
								oModel = that._ExtAPI.getModel();

							var aResponses = (oData && oData.__batchResponses) ||
								(oResponse && oResponse.data && oResponse.data.__batchResponses);


							var messageModel = oInspLotModel.getMessagesByEntity("/A_InspLotUsageDecision");

							that._InspTypCngDtTime.forEach(item => {
								if (oInspModel.getProperty("/A_InspLotUsageDecision('" + item.InspectionLot + "')"))
									messageModel.push(new sap.ui.core.message.Message({
										message: that._Controller.getResourceBundle().getText("inspectionLotUD") + item.InspectionLot,
										// persistent: true,
										type: sap.ui.core.MessageType.Success
									}) );
						});



					if (messageModel.length > 0) {
						messageModel.forEach(message => {
							message.setMessageProcessor(that._ExtAPI.getModel())
							message.setPersistent(true)
							sap.ui.getCore().getMessageManager().addMessages(message)
						});
						that.base.messageHandler.showMessageDialog()
					}
					else
						MessageToast.show(that._Controller.getResourceBundle().getText("successToast"));
					fnResolve();
					that.onDailogClose();
				}
					})

})
			}
var mParameters = {
	sActionLabel: "Custom Text"
};
this._ExtAPI.editFlow.securedExecution(fnFunction(this), mParameters);
		},

onItemSelect(oEvent) {
	sap.ui.getCore().byId("postbtn").setEnabled(true);
},
onafterClose: function (oEvent) {

	this._ExtAPI.refresh();
	this._oDialog.destroy();
},

validateInspLotType: function (oRecords, property) {

	const fvalue = oRecords[0].getObject().InspectionLotType;

	return oRecords.every(item => item.getObject()[property] === fvalue);

},

onRowSelection: function (oSource) {

	var oSelectedContext = oSource.getSource().getSelectedContexts();
	this._InspTypCngDtTime = [];
	var sameType = true;
	this._ILFilter = undefined;
	if (oSelectedContext.length > 0) {
		this._ILFilter = new Filter("InspectionLot", FilterOperator.EQ, oSelectedContext[0].getObject().InspectionLot);

		const isValid = this.validateInspLotType(oSelectedContext, "InspectionLotType");

		if (isValid === true) {
			oSelectedContext.forEach((element, index) => {
				if (element.getObject().InspectionLot !== "" || element.getObject().InspectionLot !== undefined) {

					this._InspTypCngDtTime.push({
						InspectionLot: element.getObject().InspectionLot,
						ChangedDateTime: element.getObject().ChangedDateTime,
						InspectionLotType: element.getObject().InspectionLotType
					});

				}

			});
		}
		this.getView().getModel("settingsModel").setProperty("/enablePostUD", isValid);

		if (!isValid) {

			var oMessage = new sap.ui.core.message.Message({
				message: this._Controller.getResourceBundle().getText("errorNosametype"),
				persistent: true, // create message as transition message
				type: sap.ui.core.MessageType.Error
			});

			this._ExtAPI.setCustomMessage(oMessage);

		}

	}
},

OnRecordUsageDec: function () {
	var oView = this.getView();
	this._ExtAPI.loadFragment({
		name: "fluidra.qm.managehu.managehandlinguints.ext.fragments.SelectDecisionCodes",
		id: oView.byId(),
		controller: this

	}).then(function (oDialog) {


		this._oDialog = oDialog;
		this.getView().addDependent(this._oDialog);
		this._oDialog.open();

	}.bind(this))
},
onDailogClose: function (oEvent) {

	this._InspTypCngDtTime = [];
	this._ILFilter = undefined;
	this._oListTable.getContent().clearSelection();
	this.getView().getModel("settingsModel").setProperty("/enablePostUD", false);
	this._oDialog.close();

},

afterDialogOpen: function (oEvent) {

	var oTable = sap.ui.getCore().byId("table0"),
		oItemTemplate = oTable.getAggregation("items")[0];


	oTable.bindItems({
		path: "/UsageCodeVH",
		filters: this._ILFilter,

		template: oItemTemplate.clone()
	});
},
onSearch: function (oEvent) {


	var sValue = oEvent.getParameter("newValue");
	var oBinding = sap.ui.getCore().byId("table0").getBinding("items");

	if (!sValue)
		oBinding.filter([]);

	else if (sValue.length < 3)
		return;
	else {
		var oFilter = new Filter({
			filters: [
				new Filter("UsageDecisionCode", FilterOperator.Contains, sValue),
				new Filter("UsageDecisionCodeText", FilterOperator.Contains, sValue),
				new Filter("UsageDecisionCodeGroup", FilterOperator.Contains, sValue),
				new Filter("SelectedCodeSet", FilterOperator.Contains, sValue),
				new Filter("SelectedCodeSetText", FilterOperator.Contains, sValue),
				new Filter("SelectedCodeSetPlant", FilterOperator.Contains, sValue),
				new Filter("InspectionLot", FilterOperator.Contains, sValue)
			],
			and: false
		});
		oBinding.filter(oFilter);
	}


}
	});
});
