const admin = require('firebase-admin');
const moment = require('moment');
const serviceAccount = require('');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let a = ['20201201', '20201202', '20201203', '20201204', '20201205', '20201206', '20201207', '20201208', '20201212',
  '20201210', '20201211', '20201212', '20201213', '20201214', '20201215', '20201216', '20201217', '20201218', '20201219',
  '20201220', '20201221', '20201222', '20201223', '20201224', '20201225', '20201226', '20201227', '20201228', '20201229', '20201230'
];

// let a = [ '20201101', '20201102', '20201103', '20201104', '20201105', '20201106', '20201107', '20201108', '20201111',
//   '20201110', '20201111', '20201112', '20201113', '20201114', '20201115', '20201116', '20201117', '20201118', '20201119',
//   '20201120', '20201121', '20201122', '20201123', '20201124', '20201125', '20201126', '20201127', '20201128', '20201129', '20201130'
// ];
const db = admin.firestore();
const vendorRef = db.collection('vendor');
vendorRef.get().then((snapshot) => {
  snapshot.forEach(async doc => {
    let mydata = doc.data();

    let myList = await vendorHistory(doc);
    if (myList.length == 0) {                           //console.log("My List Not Found")
    } else {                                           // console.log("My List---",(myList))
      for (var i = 0; i < myList.length; i++) {       //console.log("Doc-Id:---"+doc.id+" , Collection Id:---"+myList[i].id)
        if (a.includes(String(myList[i].id))) {
          let vh = await subVendorHistory(doc, myList[i]);  // console.log("vh length----",vh)
          if (!vh || vh == undefined) {             //console.log("vh not Found")
          } else {
            let allData = [];
            vh.forEach(vhdoc => {
              let vhdata = vhdoc.data();
              allData.push(vhdata)
            })
            let notOnDuty = allData.filter(nt_on_duty => {
              if (nt_on_duty.vs.toUpperCase() !== 'NOT ON DUTY') {
                return nt_on_duty
              }
            })                                      // console.log("vh on-duty----",notOnDuty)
            if (notOnDuty.length > 0) {
              let fromDate = moment.utc(notOnDuty[0].ts.toDate()).local().format().toString().replace('T', ' ').replace('+05:30', '')
              let toDate = moment.utc(notOnDuty[notOnDuty.length - 1].ts.toDate()).local().format().toString().replace('T', ' ').replace('+05:30', '')
              let difference1 = moment(toDate).diff(moment(fromDate), 'hours', true)
              console.log('Vendor_id :',doc.id,'  ', 'Start :', fromDate,'   ' ,'End :', toDate,'     ' ,'Working_hours :', difference1)
            }
          }
        }
      }
    }
  });
});
function vendorHistory(doc) {
  return new Promise((resolve) => {
    db.collection('vendor_history').doc(doc.id).listCollections().then((myList) => {
      resolve(myList)
    }).catch([])
  })
}
function subVendorHistory(doc, collection) {
  return new Promise((resolve) => {
    db.collection(`vendor_history/${doc.id}/${collection.id}/`).orderBy('ts').get().then((vh) => {
      resolve(vh)
    }).catch([])
  })
}
