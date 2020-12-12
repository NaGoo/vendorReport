//const xlsx = require('xlsx');
const admin = require("firebase-admin");
const moment = require("moment");
const serviceAccount = require("./ra-dev-mechapp-9226f801c92c.json");
//const ExcelJS = require('exceljs/dist/es5');
const Excel = require("exceljs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
let a = [
  "20201201",
  "20201202",
  "20201203",
  "20201204",
  "20201205",
  "20201206",
  "20201207",
  "20201208",
  "20201212",
  "20201210",
  "20201211",
  "20201212",
  "20201213",
  "20201214",
  "20201215",
  "20201216",
  "20201217",
  "20201218",
  "20201219",
  "20201220",
  "20201221",
  "20201222",
  "20201223",
  "20201224",
  "20201225",
  "20201226",
  "20201227",
  "20201228",
  "20201229",
  "20201230",
];

const db = admin.firestore();
const vendorRef = db.collection("vendor");
let workbook = new Excel.Workbook();
let worksheet = workbook.addWorksheet("Record1");
vendorRef.get().then((snapshot) => {
  //console.log(snapshot);
  snapshot.forEach((doc) => {
    let mydata = doc.data(); //console.log(mydata);
    db.collection("vendor_history")
      .doc(doc.id)
      .listCollections()
      .then((myList) => {
        let listOfCollections = [];
        // console.log(myList);
        myList.forEach((collection) => {
          if (a.includes(String(collection.id))) {
            db.collection(`vendor_history/${doc.id}/${collection.id}/`)
              .orderBy("ts")
              .get()
              .then((vh) => {
                worksheet.columns = [
                  { header: "Time", key: "ts" },
                  { header: "Status", key: "vs" },
                ];
                getDataToExport(vh).then((response) => {
                  workbook.xlsx.writeFile("NewRecord3.xlsx");
                });
              });
          }
        });
      });
  });
});

function getDataToExport(vh) {
  let tempOb = [];
  return new Promise((resolve) => {
    vh.forEach((vhdoc, index) => {
      let vhdata = vhdoc.data();
      console.log(vhdata);
      //console.log(vhdata.length)

      if (vhdata.vs.toUpperCase() !== "NOT ON DUTY") {
        let obj = {
          ts: moment
            .utc(vhdata.ts.toDate())
            .local()
            .format()
            .toString()
            .replace("T", "")
            .replace("+05:30", ""),
          vs: vhdata.vs,
        };
        tempOb.push(obj);
      }
      setTimeout(() => {
        tempOb.forEach((element, index) => {
          worksheet.addRow({ element });
          if (index == tempOb.length - 1) {
            workbook.xlsx.writeFile("NewRecord.xlsx");
            resolve();
          }
        });
      }, 15000);
    });
  });
}

// db.collection(`vendor_history/19/20200914/`).orderBy('ts').get().then((vh) => {
//   vh.forEach(vhdoc => {
//     let vhdata = vhdoc.data();
//     // if (vhdata.vs.toUpperCase() !== 'NOT ON DUTY') {
//     // console.log(vhdata.ts.toDate());
//     console.log(vhdoc.id, ',', moment.utc(vhdata.ts.toDate()).local().format().toString().replace('T', ' ').replace('+5:30', ''), ',', vhdata.vs);
//     // }
//   });
// });

// db.collection(`vendor`).get().then((vd) => {
//   vd.forEach((vd) => {
//     let v = vd.data
//     console.log(v.id, v.vs, v.ts, v.VendorStatus, v.mrodt);
//   })
// });

// var newWB = xlsx.utils.book_new();
//                 var newWS = xlsx.utils.json_to_sheet(doc.id);
//                 xlsx.utils.book_append_sheet (newWB, newWS, "New Data8");
//               xlsx.writeFile(newWB, "New Data8 File.xlsx");
