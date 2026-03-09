import Settings from "./settings.model.js";

export const getCratePricesService = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      global_crate_type_1_price: 0,
      global_crate_type_2_price: 0,
    });
  }
  return settings;
};

export const updateCratePricesService = async (data) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(data);
  } else {
    if (data.global_crate_type_1_price !== undefined) {
      settings.global_crate_type_1_price = data.global_crate_type_1_price;
    }
    if (data.global_crate_type_2_price !== undefined) {
      settings.global_crate_type_2_price = data.global_crate_type_2_price;
    }
    await settings.save();
  }
  return settings;
};
