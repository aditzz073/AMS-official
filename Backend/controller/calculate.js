
const calculateCategorySum = (data, category) => {
  const roles = ["Self", "HoD", "External"];
  const sums = {};
  
  roles.forEach((role) => {
    const key = `${category}${role}`;
    sums[key] = Object.keys(data)
      .filter((field) => field.startsWith(`${category}`) && field.endsWith(`${role}`))
      .reduce((sum, field) => sum + (parseInt(data[field]) || 0), 0);
  });

  return sums;
};

const evaluateScores = async (req, res) => {
  try {
    const data = req.body;

    const categories = ["TLP", "PDRC", "CDL", "CIL", "IOW"];
    let totals = {};
    let totalSelf = 0;
    let totalHoD = 0;
    let totalExternal = 0;

    categories.forEach((category) => {
      const sum = calculateCategorySum(data, category);
      totals = { ...totals, ...sum };

      // Sum all Self, HoD, External values
      totalSelf += sum[`${category}Self`] || 0;
      totalHoD += sum[`${category}HoD`] || 0;
      totalExternal += sum[`${category}External`] || 0;
    });

    // Add the total sum for each role
    totals["totalSelf"] = totalSelf;
    totals["totalHoD"] = totalHoD;
    totals["totalExternal"] = totalExternal;

    res.status(200).json({
      success: true,
      message: "Evaluation stored successfully",
      totals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default evaluateScores;
