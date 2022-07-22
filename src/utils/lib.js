/* eslint-disable no-extend-native */
import { ethers } from "ethers";
import PartialConstants from "../constants/partial.constants";
import { v4 as uuidv4 } from "uuid";

var CryptoJS = require("crypto-js");

export function formatLocaleString(x,digits){
  return x.toLocaleString('en-IN',{currency:"USD", maximumSignificantDigits:  digits || 10 })
}
export function numberWithCommas(num) {
  num = num.toLocaleString('en-IN',{ maximumSignificantDigits: 10  })
  let x = num.toString().split(".");
    x[0] = x[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return x.join(".");
}

String.prototype.isMatch = function (pattern) {
  return pattern.test(this);
};
/**
 * This function is used to compare ignore cases of string.
 * @param {otherString} otherString is the string that need to be compared with this string
 * @returns true if the string is equal, false if it's not.
 */
String.prototype.equals = function (otherString) {
  return this.toLowerCase() === otherString?.toString().toLowerCase();
};

export const getDeadline = () => Math.round(new Date().getTime() / 1000) + 3600;

export const getTimeStamp = () => new Date().getTime().toString();

export function formatUriSecure(url) {
  const currentDate = new Date();
  const secureKey = process.env.REACT_APP_SECURE_KEY;
  const secureTime = process.env.REACT_APP_SECURE_TIME;

  let expireTime = currentDate.getTime() / 1000 + Number(secureTime);
  expireTime = Math.round(expireTime);

  let secure_link = `${secureKey}${expireTime}${url}`;
  secure_link = CryptoJS.MD5(secure_link, "binary").toString(
    CryptoJS.enc.Base64
  );
  secure_link = secure_link.replaceAll("+", "-");
  secure_link = secure_link.replaceAll("/", "_");
  secure_link = secure_link.replace(/=/g, "");

  return url + `?st=${secure_link}&e=${expireTime}`;
}

export function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

export const isContainVET = (...ags) =>
  [...ags].includes(process.env.REACT_APP_TOKEN_WVET);

/**
 * Get the decimal number of the given asset tokens
 * @param {assetsAddress} assetsAddress is the address of the asset that we need to get the decimal value from
 * @returns the corresponding decimal value of the asset that
 */
export const getDecimalForAsset = (assetsAddress) =>
  assetsAddress === process.env.REACT_APP_TOKEN_VEUSD
    ? PartialConstants.VEUSD_DECIMAL
    : PartialConstants.DEFAULT_ASSET_DECIMAL;

export const typeOf = (value) => Object.prototype.toString.call(value);

export const getWeiUnitByDecimal = (decimal) => {
  switch (decimal) {
    case 6:
      return "mwei";
    case 12:
      return "micro";
    case 18:
      return "ether";
    default:
      return "";
  }
};

export const getAmountInWeiFormatted = (web3, amount, decimalNumber) => {
  if (!web3) throw new Error("Web3 is required");
  else if (!amount || amount === 0 || amount === 0.0)
    throw new Error("Amount is required");
  else if (!decimalNumber) throw new Error("DecimalNumber is required");

  if (decimalNumber < PartialConstants.DEFAULT_ASSET_DECIMAL)
    amount = Number(amount).toFixed(decimalNumber);

  return web3?.utils.toWei(
    amount.toString(),
    getWeiUnitByDecimal(decimalNumber)
  );
};

export const getDecimalForAssetPair = (firstAssetAddress, secondAssetAddress) =>
  [firstAssetAddress, secondAssetAddress].includes(
    process.env.REACT_APP_TOKEN_VEUSD
  )
    ? PartialConstants.LIQUIDITY_PAIR_CONTAIN_VET_DECIMAL
    : PartialConstants.DEFAULT_ASSET_DECIMAL;

export async function copyTextToClipboard(text) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

export const randomKeyUUID = () => {
  return uuidv4();
};

export const addressWalletCompact = (address) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length
  )}`;
};
export const compareString = (a, b) => {
  return a?.toString().toLowerCase() === b?.toString().toLowerCase();
};
