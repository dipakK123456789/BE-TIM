const { types } = require("joi");
const salesPerson = require("../model/salesPerson.model");
const user = require("../model/user.model");
var jwt = require("jsonwebtoken");
const { Types, default: mongoose } = require("mongoose");

// SalesPersonCreate
exports.personCreate = async (req, res) => {
  try {
    const { Name, mobileNo } = req.body;

    const findMob = await salesPerson.findOne({ mobileNo });
    if (findMob) {
      return res.status(400).json({
        status: "Fail",
        message: "Mobile Number already exist",
      });
    }
    const sales = await salesPerson.create({
      Name,
      mobileNo,
    });
    await sales.save();

    const payload = {
      Name: Name,
      mobileNo: mobileNo,
    };
    let token = jwt.sign(payload, process.env.KEY, { expiresIn: "1d" });
    res.status(200).json({
      status: "Success",
      message: "SalesPerson Create Successfully",
      data: sales,
      token: token,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

// SalesPersonUpdate
exports.personUpdate = async (req, res) => {
  try {
    const { Name, mobileNo } = req.body;

    // const findMob = await salesPerson.findOne({ mobileNo });
    // if (findMob) {
    //   return res.status(400).json({
    //     status: "Fail",
    //     message: "Mobile Number already exist",
    //   });
    // }

    const updatePerson = {
      Name,
      mobileNo,
    };
    const personData = await salesPerson.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updatePerson },
      { new: true }
    );
    if (!personData) {
      return res.status(400).json({
        status: "Fail",
        message: "salesPerson not found",
      });
    }
    res.status(200).json({
      status: "Success",
      message: "salesPerson Update Successfully",
      data: personData,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: "Internal Server Error",
    });
  }
};

// SalesPersonDelete
exports.PersonDelete = async (req, res) => {
  try {
    const personDataDelete = await salesPerson.findByIdAndDelete({
      _id: req.params.id,
    });
    if (!personDataDelete) {
      return res.status(400).json({
        status: "Fail",
        message: "salesPerson not found",
      });
    }
    res.status(200).json({
      status: "Success",
      message: "salesPerson delete successfully",
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: "Internal; Server Error",
    });
  }
};

// salesPersonView
exports.salesPersonView = async (req, res) => {
  try {
    const salesPersonData = await salesPerson.findById({ _id: req.params.id });
    if (!salesPersonData) {
      return res.status(400).json({
        status: "Fail",
        message: "user not found",
      });
    }
    res.status(201).json({
      status: "Success",
      message: "salesPeron Fetch Successfully",
      data: salesPersonData,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// PersonListData
exports.salesPersonListData = async (req, res) => {
  try {
    const personList = await salesPerson.find();
    const personListData = await salesPerson.find();
    var Datacount = personListData.length;
    res.status(200).json({
      status: "Success",
      message: "get all data",
      count: Datacount,
      data: personList,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// salesPersonList date wise
// exports.salesPersonList = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const startDate = req.query.startDate
//       ? new Date(req.query.startDate)
//       : new Date(0);
//     const endDate = req.query.endDate
//       ? new Date(req.query.endDate)
//       : new Date();
//     const status = req.query.status;

//     let matchField = {}; // Initialize an empty object

//     if (status) {
//       if (status === "approve") {
//         matchField["connectedUsers.followDetails.Approve"] = true;
//       } else if (status === "reject") {
//         matchField["connectedUsers.followDetails.Reject"] = true;
//       } else if (status === "followup") {
//         matchField["connectedUsers.followDetails.followup"] = true;
//       }
//     }
//     // function getFollowDetailsStatusFilter(status) {
//     //   if (status === "approve") {
//     //     return { "connectedUsers.followDetails.Approve": true };
//     //   } else if (status === "reject") {
//     //     return { "connectedUsers.followDetails.Reject": true };
//     //   } else if (status === "followup") {
//     //     return { "connectedUsers.followDetails.followup": true };
//     //   } else {
//     //     return {}; // Return an empty object if status is not provided or invalid
//     //   }
//     // }

//     const usersConnectedToSales = await salesPerson.aggregate([
//       {
//         $match: {
//           _id: new Types.ObjectId(id),
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "sales",
//           as: "connectedUsers",
//         },
//       },
//       {
//         $unwind: "$connectedUsers",
//       },
//       {
//         $lookup: {
//           from: "follows",
//           localField: "connectedUsers._id",
//           foreignField: "quatationId",
//           as: "connectedUsers.followDetails",
//         },
//       },
//       {
//         $match: matchField,
//       },
//       {
//         $match: {
//           // "connectedUsers.Date": { $gte: startDate, $lte: endDate },
//           $and: [
//                 { "connectedUsers.Date": { $gte: startDate } },
//                 { "connectedUsers.Date": { $lte: endDate } },
//               ],
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userName: { $first: "$Name" },
//           mobileNo: { $first: "$mobileNo" },
//           connectedUsers: { $push: "$connectedUsers" },
//         },
//       },
//       {
//         $project: {
//           __v: 0,
//         },
//       },
//     ]);

//     // console.log(usersConnectedToSales);
//     // if (usersConnectedToSales.length === 0) {
//     //   return res.status(404).json({
//     //     status: "Fail",
//     //     message: "No users connected to the SalesPerson",
//     //   });
//     // }
//     console.log(usersConnectedToSales);
//     res.status(200).json({
//       status: "Success",
//       message: "Get all data",
//       data: usersConnectedToSales,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({
//       status: "Fail",
//       message: error.message,
//     });
//   }
// };

// salesPersonList date wise
exports.salesPersonList = async (req, res) => {
  try {
    const id = req.params.id;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(0);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();
    const status = req.query.status;

    let matchField = {}; // Initialize an empty object

    if (status) {
      if (status === "approve") {
        matchField["connectedUsers.followDetails.Approve"] = true;
      } else if (status === "reject") {
        matchField["connectedUsers.followDetails.Reject"] = true;
      } else if (status === "followup") {
        matchField["connectedUsers.followDetails.followup"] = true;
      }
    }

    // Handle the case where startDate and endDate are not provided
    if (req.query.startDate || req.query.endDate) {
      matchField.$and = [
        { "connectedUsers.Date": { $gte: startDate } },
        { "connectedUsers.Date": { $lte: endDate } },
      ];
    }

    const usersConnectedToSales = await salesPerson.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "sales",
          as: "connectedUsers",
        },
      },
      {
        $unwind: "$connectedUsers",
      },
      {
        $lookup: {
          from: "follows",
          localField: "connectedUsers._id",
          foreignField: "quatationId",
          as: "connectedUsers.followDetails",
        },
      },
      {
        $match: matchField,
      },
      {
        $group: {
          _id: "$_id",
          userName: { $first: "$Name" },
          mobileNo: { $first: "$mobileNo" },
          connectedUsers: { $push: "$connectedUsers" },
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    res.status(200).json({
      status: "Success",
      message: "Get all data",
      data: usersConnectedToSales,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// exports.salesPersonList = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
//     const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
//     const status = req.query.status;

//     let matchField = {}; // Initialize an empty object

//     if (status) {
//       if (status === "approve") {
//         matchField["connectedUsers.followDetails.Approve"] = true;
//       } else if (status === "reject") {
//         matchField["connectedUsers.followDetails.Reject"] = true;
//       } else if (status === "followup") {
//         matchField["connectedUsers.followDetails.followup"] = true;
//       }
//     }
//     console.log(matchField);
//     const usersConnectedToSales = await salesPerson.aggregate([
//       {
//         $match: {
//           _id: new Types.ObjectId(id),
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "sales",
//           as: "connectedUsers",
//         },
//       },
//       {
//         $unwind: "$connectedUsers",
//       },
//       {
//         $lookup: {
//           from: "follows",
//           localField: "connectedUsers._id",
//           foreignField: "quatationId",
//           as: "connectedUsers.followDetails",
//         },
//       },

//       {
//         $match: {
//           "connectedUsers.Date": { $gte: startDate, $lte: endDate },
//           ...matchField, // Include the status filter
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           userName: { $first: "$Name" },
//           mobileNo: { $first: "$mobileNo" },
//           connectedUsers: { $push: "$connectedUsers" },
//         },
//       },
//       {
//         $project: {
//           __v: 0,
//         },
//       },
//     ]);
//     console.log(usersConnectedToSales);
//     res.status(200).json({
//       status: "Success",
//       message: "Get all data",
//       data: usersConnectedToSales,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({
//       status: "Fail",
//       message: error.message,
//     });
//   }
// };

// salesPersonSearch
exports.salesPersonSearch = async (req, res) => {
  try {
    let matchField = {};

    if (req.query.SalesPersonName) {
      matchField.Name = new RegExp(req.query.SalesPersonName, "i");
    }

    const searchData = await salesPerson
      .aggregate([
        {
          $match: matchField,
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "sales",
            as: "user",
          },
        },
        {
          $project: {
            __v: 0,
            "SalesPersonData.__v": 0,
          },
        },
      ])
      .exec();

    if (!searchData || searchData.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "Data not found",
      });
    }
    res.status(200).json({
      status: "Success",
      message: "Fetch Data Successfully",
      data: searchData,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// using id salesPersonListWithUser
exports.salesPersonListWithUser = async function (req, res) {
  try {
    const personId = req.params.id;

    const usersConnectedToPerson = await user.aggregate([
      {
        $match: {
          sales: new mongoose.Types.ObjectId(personId),
        },
      },
      {
        $lookup: {
          from: "salespeople",
          localField: "sales",
          foreignField: "_id",
          as: "salesPersonDetails",
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    if (usersConnectedToPerson.length === 0) {
      return res.status(404).json({
        status: "Fail",
        message: "No users connected to the SalesPerson",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "get all data",
      data: usersConnectedToPerson,
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};
