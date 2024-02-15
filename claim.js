var claimsDomain = "https://core.haircomber.com";
var claims = [];
const seenClaims = new Set();
var blockHash = "";
var blockHeight = 0;
var btcPrice = 50000; // TODO: use real btc price

function getTopNClaims(n) {
    const seenTx = new Set();
    const topN = [];
    for (let obj of claims) {
        if (topN.length < n || obj.FeeWeightKb > Math.min(...topN.map(item => item.FeeWeightKb))) {
            if (topN.length === n) {
                const minFeeWeightKb = Math.min(...topN.map(item => item.FeeWeightKb));
                const index = topN.findIndex(item => item.FeeWeightKb === minFeeWeightKb);
                topN.splice(index, 1);
            }
            if (!seenTx.has(obj.TxId)) {
                topN.push(obj);
                seenTx.add(obj.TxId);
            }
        }
    }
    return topN;
}
function loadClaims() {
  claimsURL = claimsDomain + "/chartmempool.js";
  let html = document.createElement("script");
  html.src = claimsURL;
  document.body.append(html);
}

function p(data) {
  if (!data.Success) {
    return;
  }
  if ((data.Tx == null) && (data.Commits !== null)) {
    // delete it
    for (var i = claims.length - 1; i >= 0; --i) {
      if (claims[i].Commitment in data.Commits) {
        claims.splice(i,1);
      }
    }
  } else if ((data.Tx !== null) && (data.Commits == null)) {

    for (var txi in data.Tx) {
      var tx = data.Tx[txi];
      for (var outi in tx.TxOut) {
        var out = tx.TxOut[outi];
        var seenID = tx.TxId.toLowerCase() + out.Commitment.toLowerCase();
        if (!seenClaims.has(seenID)) {
          seenClaims.add(seenID);
          var d = new Date();
          d.setMilliseconds(Math.random()*1000)
          claims.push({ 
            When: d,
            TxId: tx.TxId,

            FeeWeightKb: tx.FeeWeightKb,
            Commitment: out.Commitment,
            Fee: tx.Fee,
            Top: false,
          });
        }
      }
    }

    if (claims.length > 0) {
      if (data.BlockHash != blockHash) {
        blockHash = data.BlockHash;
        blockHeight = data.BlockHeight;
        // round of filtering
        load5dot();
        return;
      }
    }
  }
  var best = getTopNClaims(1);
  if (best.length != 0) {
    best = best[0];
    best.Top = true;
  }

  // render ui
  setTopFee();
  setChart();
  // another round of loading
  loadClaims();
  return;
}

function load5dot() {
  var query = "";
  for (var i in claims) {
    var claim = claims[i];
    var commit = claim.Commitment.substring(0, 2*9);
    query += commit;
    // every 256 commits we fire a separate filtering request - this is needed because the server does have limited capacity
    if ((i % 256) == 255) {
      claimsURL = claimsDomain + "/00000001.0000000000000000.00000009.9999999999999999." + query + ".js";
      let html = document.createElement("script");
      html.src = claimsURL;
      document.body.append(html);
      //reset query
      query = "";
    }
  }
  claimsURL = claimsDomain + "/00000001.0000000000000000.00000009.9999999999999999." + query + ".js";
  let html = document.createElement("script");
  html.src = claimsURL;
  document.body.append(html);
}

//-- Coinbase functions

function Coinbase(height) {
	if ((height >= 21835313) || (height == 0)) {
		return 0
	}
	const lost_natasha = 0.00000001;
	var ll = Math.log2((height) + lost_natasha);
	var l = Math.log2((height));
	var subsidy_proposed = 210000000 - (Math.floor(l*l*l*l*l*ll));
	return subsidy_proposed;
}
//-- Segwit functions
const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

const generator = [0x3b6a57b2n, 0x26508e6dn, 0x1ea119fan, 0x3d4233ddn, 0x2a1462b3n];

function polymod(values) {
  let chk = BigInt(1);
  for (const v of values) {
    let top = chk >> BigInt(25);
    chk = ((chk & BigInt(0x1ffffff)) << BigInt(5)) ^ BigInt(v);
    for (let i = 0; i < 5; i++) {
      if ((top >> BigInt(i)) & BigInt(1)) {
        chk ^= generator[i];
      }
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  const ret = [];
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

function verifyChecksum(hrp, data) {
  return polymod(hrpExpand(hrp).concat(data)) === 1;
}

function createChecksum(hrp, data) {
  const values = hrpExpand(hrp).concat(data);
  const mod = BigInt(polymod(values.concat(Array(6).fill(0))) ^ BigInt(1));
  const ret = [];
  const mask = BigInt(31);
  for (let p = 0; p < 6; p++) {
    ret[p] = Number((mod >> BigInt(5 * (5 - p))) & mask);
  }
  return ret;
}
function Encode(hrp, data) {
  if (hrp.length + data.length + 7 > 90) {
    throw new Error(`too long: hrp length=${hrp.length}, data length=${data.length}`);
  }
  if (hrp.length < 1) {
    throw new Error(`invalid hrp: hrp=${hrp}`);
  }
  for (let p = 0; p < hrp.length; p++) {
    const c = hrp.charCodeAt(p);
    if (c < 33 || c > 126) {
      throw new Error(`invalid character human-readable part: hrp[${p}]=${c}`);
    }
  }
  if (!(hrp.toUpperCase() === hrp || hrp.toLowerCase() === hrp)) {
    throw new Error(`mix case: hrp=${hrp}`);
  }
  const lower = hrp.toLowerCase() === hrp;
  hrp = hrp.toLowerCase();
  const combined = data.concat(createChecksum(hrp, data));
  let ret = hrp + "1";
  for (const p of combined) {
    if (p < 0 || p >= charset.length) {
      throw new Error(`invalid data: data[${p}]=${p}`);
    }
    ret += charset.charAt(p);
  }
  return lower ? ret : ret.toUpperCase();
}

function Decode(bechString) {
  if (bechString.length > 90) {
    throw new Error(`too long: len=${bechString.length}`);
  }
  if (!(bechString.toLowerCase() === bechString || bechString.toUpperCase() === bechString)) {
    throw new Error(`mixed case`);
  }
  bechString = bechString.toLowerCase();
  const pos = bechString.lastIndexOf("1");
  if (pos < 1 || pos + 7 > bechString.length) {
    throw new Error(`separator '1' at invalid position: pos=${pos}, len=${bechString.length}`);
  }
  const hrp = bechString.substring(0, pos);
  for (let p = 0; p < hrp.length; p++) {
    const c = hrp.charCodeAt(p);
    if (c < 33 || c > 126) {
      throw new Error(`invalid character human-readable part: bechString[${p}]=${c}`);
    }
  }
  const data = [];
  for (let p = pos + 1; p < bechString.length; p++) {
    const d = charset.indexOf(bechString.charAt(p));
    if (d === -1) {
      throw new Error(`invalid character data part: bechString[${p}]=${bechString.charCodeAt(p)}`);
    }
    data.push(d);
  }
  if (!verifyChecksum(hrp, data)) {
    throw new Error(`invalid checksum`);
  }
  return [hrp, data.slice(0, data.length - 6)];
}
function convertbits(data, frombits, tobits, pad) {
  let acc = 0n;
  let bits = 0;
  const ret = [];
  const maxv = (1n << BigInt(tobits)) - 1n;
  for (let idx = 0; idx < data.length; idx++) {
    const value = data[idx];
    if (value < 0 || (value >> frombits) !== 0) {
      throw new Error(`invalid data range: data[${idx}]=${value} (frombits=${frombits})`);
    }
    acc = (acc << BigInt(frombits)) | BigInt(value);
    bits += frombits;
    while (bits >= tobits) {
      bits -= tobits;
      ret.push(Number((acc >> BigInt(bits)) & maxv));
    }
  }
  if (pad) {
    if (bits > 0) {
      ret.push(Number((acc << BigInt(tobits - bits)) & maxv));
    }
  } else if (bits >= frombits) {
    throw new Error(`illegal zero padding`);
  } else if (((acc << BigInt(tobits - bits)) & maxv) !== 0n) {
    throw new Error(`non-zero padding`);
  }
  return ret;
}


function SegwitAddrEncode(hrp, version, program) {
  if (version < 0 || version > 16) {
    throw new Error(`invalid witness version: ${version}`);
  }
  if (program.length < 2 || program.length > 40) {
    throw new Error(`invalid program length: ${program.length}`);
  }
  if (version === 0 && program.length !== 20 && program.length !== 32) {
    throw new Error(`invalid program length for witness version 0 (per BIP141): ${program.length}`);
  }
  const data = convertbits(program, 8, 5, true);
  const ret = Encode(hrp, [version].concat(data));
  return ret;
}
function hexStringToByteArray(hexString) {
  var result = [];
  for (var i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substr(i, 2), 16));
  }
  return result;
}

function segwitAddrEncodeFull(hexString) {
  var byteArray = hexStringToByteArray(hexString);
  return SegwitAddrEncode("bc", 0, byteArray);
}


//-- UI Functions

function setTopFee() {
  var topFeeClaim = getTopNClaims(5);
  if (topFeeClaim.length == 0) {
    // clear top area if no claims
    document.getElementById("topFeeMBTC").innerText = "Loading...";
    document.getElementById("topFeeAddr").innerText = "Loading...";
    document.getElementById("transactionList").innerHTML = "<li>Loading...</li>";
    return;
  }
  topFeeClaim.sort((a, b) => b.FeeWeightKb - a.FeeWeightKb);
  document.getElementById("combPriceDollars").innerText = "$" + Math.round(100 * btcPrice * topFeeClaim[0].Fee / Coinbase(blockHeight+1)) / 100;

  // Format the BTC address and commit
  let fullAddress = segwitAddrEncodeFull(topFeeClaim[0].Commitment);
  let formattedAddress = fullAddress.substring(0, 6) + "..." + fullAddress.substring(fullAddress.length - 4);
  let fullTxId = topFeeClaim[0].TxId;
  let formattedTxId = fullTxId.substring(0, 6) + "..." + fullTxId.substring(fullTxId.length - 4);

  // Set the top fee value
  document.getElementById("topFeeMBTC").innerText = 
    `${topFeeClaim[0].FeeWeightKb / 250} sats/vB`;

  // Create clickable elements for the BTC address and commit
  let topFeeAddrDiv = document.getElementById("topFeeAddr");
  topFeeAddrDiv.innerHTML = ""; // Clear previous content
  topFeeAddrDiv.appendChild(createClickableElement(formattedAddress, fullAddress));
  topFeeAddrDiv.appendChild(createClickableElement(formattedTxId, fullTxId));

  // Update the transaction list with clickable formatted BTC addresses
  document.getElementById("transactionList").innerHTML = "";
  for (var i in topFeeClaim) {
    var claim = topFeeClaim[i];
    let li = document.createElement("li");
    li.appendChild(createClickableElement(
      segwitAddrEncodeFull(claim.Commitment).substring(0, 6) + "..." + 
      segwitAddrEncodeFull(claim.Commitment).substring(segwitAddrEncodeFull(claim.Commitment).length - 4),
      segwitAddrEncodeFull(claim.Commitment)
    ));
    // Only display sats/vB
    li.appendChild(document.createTextNode(" - " + (claim.FeeWeightKb / 250).toFixed(3) + " sats/vB"));
    document.getElementById("transactionList").appendChild(li);
  }
}

function createClickableElement(displayText, fullText) {
  let container = document.createElement('div');
  container.className = 'fee-tooltip';
  let span = document.createElement('span');
  span.className = 'clickable';
  span.textContent = displayText;
  span.onclick = function() { copyToClipboard(fullText); };
  container.appendChild(span);

  let tooltipText = document.createElement('span');
  tooltipText.className = 'fee-tooltiptext';
  tooltipText.textContent = fullText; // The full text will be in the tooltip
  container.appendChild(tooltipText);

  return container;
}



function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("Copied to clipboard: " + text)) // You can replace this with a less intrusive notification
    .catch(err => console.error('Could not copy text: ', err));
}

function setChart() {
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  const seenTx = new Set();
  for (var i in claims) {
    var claim = claims[i];
    if (seenTx.has(claim.TxId)) {
      continue; // skip multidot
    }
    seenTx.add(claim.TxId);
    // Add data point as sats/vB
    chart.data.datasets[claim.Top ? 0: 1].data.push({
      x: claim.When,
      y: claim.FeeWeightKb / 250, // Convert to sats/vB
    });
  }
  chart.update();
}


