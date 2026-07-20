sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"fluidra/qm/managehu/managehandlinguints/test/integration/pages/ManageHandlingUnitsList.gen",
	"fluidra/qm/managehu/managehandlinguints/test/integration/pages/ManageHandlingUnitsObjectPage.gen"
], function (JourneyRunner, ManageHandlingUnitsListGenerated, ManageHandlingUnitsObjectPageGenerated) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('fluidra/qm/managehu/managehandlinguints') + '/test/flp.html#app-preview',
        pages: {
			onTheManageHandlingUnitsListGenerated: ManageHandlingUnitsListGenerated,
			onTheManageHandlingUnitsObjectPageGenerated: ManageHandlingUnitsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

