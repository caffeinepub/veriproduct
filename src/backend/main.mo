import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Product = {
    id : Text;
    name : Text;
    manufacturer : Text;
    productionDate : Text;
    currentOwner : Text;
    batchNumber : Text;
    serialNumber : Text;
    warrantyInfo : Text;
    distributorName : Text;
    distributorContact : Text;
    distributorAddress : Text;
    distributorCountry : Text;
    registeredAt : Int;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  type VerificationResult = {
    status : Text; // "genuine" | "fake" | "not found"
    matchedProductDetails : ?Product;
    originalProductDetails : ?Product; // populated when status is "fake"
    reason : Text;
    fakeIndicators : [Text]; // list of red flags
  };

  type VerificationLog = {
    productSearched : Text;
    resultStatus : Text;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let verificationLogs = Map.empty<Int, VerificationLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── Real-world product registry ──
  let sampleProducts = [
    // Apple
    { id = "APPLE-IPHONE15-PRO"; name = "Apple iPhone 15 Pro"; manufacturer = "Apple Inc."; productionDate = "2023-09-22"; currentOwner = "Apple Authorized"; batchNumber = "APL2023-IP15P"; serialNumber = "F2LXQ9KXPF"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1695340800000000000 },
    { id = "APPLE-IPHONE14"; name = "Apple iPhone 14"; manufacturer = "Apple Inc."; productionDate = "2022-09-16"; currentOwner = "Apple Authorized"; batchNumber = "APL2022-IP14"; serialNumber = "G3MXR7KXPL"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1663286400000000000 },
    { id = "APPLE-IPAD-AIR5"; name = "Apple iPad Air 5th Gen"; manufacturer = "Apple Inc."; productionDate = "2022-03-18"; currentOwner = "Apple Authorized"; batchNumber = "APL2022-IPADAIR5"; serialNumber = "DLXQ2KMPF1"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1647561600000000000 },
    { id = "APPLE-MACBOOK-PRO14"; name = "Apple MacBook Pro 14-inch"; manufacturer = "Apple Inc."; productionDate = "2023-11-07"; currentOwner = "Apple Authorized"; batchNumber = "APL2023-MBP14"; serialNumber = "C02ZL0FJMD6T"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1699315200000000000 },
    { id = "APPLE-AIRPODS-PRO2"; name = "Apple AirPods Pro 2nd Gen"; manufacturer = "Apple Inc."; productionDate = "2022-09-23"; currentOwner = "Apple Authorized"; batchNumber = "APL2022-APP2"; serialNumber = "H2XRQ5KXPL"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1663891200000000000 },
    { id = "APPLE-WATCH-S9"; name = "Apple Watch Series 9"; manufacturer = "Apple Inc."; productionDate = "2023-09-22"; currentOwner = "Apple Authorized"; batchNumber = "APL2023-AWS9"; serialNumber = "GX2RQ7KXPL"; warrantyInfo = "1 year limited warranty"; distributorName = "Apple Inc."; distributorContact = "support@apple.com"; distributorAddress = "One Apple Park Way, Cupertino, CA"; distributorCountry = "USA"; registeredAt = 1695340800000000000 },
    // Samsung
    { id = "SAMSUNG-S24-ULTRA"; name = "Samsung Galaxy S24 Ultra"; manufacturer = "Samsung Electronics"; productionDate = "2024-01-17"; currentOwner = "Samsung Authorized"; batchNumber = "SAM2024-S24U"; serialNumber = "R5CT70BXPML"; warrantyInfo = "1 year manufacturer warranty"; distributorName = "Samsung Electronics"; distributorContact = "support@samsung.com"; distributorAddress = "129 Samsung-ro, Yeongtong-gu, Suwon"; distributorCountry = "South Korea"; registeredAt = 1705449600000000000 },
    { id = "SAMSUNG-S23"; name = "Samsung Galaxy S23"; manufacturer = "Samsung Electronics"; productionDate = "2023-02-17"; currentOwner = "Samsung Authorized"; batchNumber = "SAM2023-S23"; serialNumber = "R3DT50BXKML"; warrantyInfo = "1 year manufacturer warranty"; distributorName = "Samsung Electronics"; distributorContact = "support@samsung.com"; distributorAddress = "129 Samsung-ro, Yeongtong-gu, Suwon"; distributorCountry = "South Korea"; registeredAt = 1676592000000000000 },
    { id = "SAMSUNG-TAB-S9"; name = "Samsung Galaxy Tab S9"; manufacturer = "Samsung Electronics"; productionDate = "2023-08-11"; currentOwner = "Samsung Authorized"; batchNumber = "SAM2023-TABS9"; serialNumber = "T7DT50BXKML"; warrantyInfo = "1 year manufacturer warranty"; distributorName = "Samsung Electronics"; distributorContact = "support@samsung.com"; distributorAddress = "129 Samsung-ro, Yeongtong-gu, Suwon"; distributorCountry = "South Korea"; registeredAt = 1691712000000000000 },
    { id = "SAMSUNG-BUDS2-PRO"; name = "Samsung Galaxy Buds2 Pro"; manufacturer = "Samsung Electronics"; productionDate = "2022-08-10"; currentOwner = "Samsung Authorized"; batchNumber = "SAM2022-BUDS2P"; serialNumber = "R2ET30BXKML"; warrantyInfo = "1 year manufacturer warranty"; distributorName = "Samsung Electronics"; distributorContact = "support@samsung.com"; distributorAddress = "129 Samsung-ro, Yeongtong-gu, Suwon"; distributorCountry = "South Korea"; registeredAt = 1660089600000000000 },
    // Nike
    { id = "NIKE-AIR-MAX-270"; name = "Nike Air Max 270"; manufacturer = "Nike Inc."; productionDate = "2024-01-15"; currentOwner = "Nike Official"; batchNumber = "NK2024-AM270"; serialNumber = "NKE-AM270-2024-001"; warrantyInfo = "30-day return policy"; distributorName = "Nike Inc."; distributorContact = "consumer.affairs@nike.com"; distributorAddress = "1 Bowerman Drive, Beaverton, OR"; distributorCountry = "USA"; registeredAt = 1705276800000000000 },
    { id = "NIKE-AIR-FORCE-1"; name = "Nike Air Force 1"; manufacturer = "Nike Inc."; productionDate = "2024-02-01"; currentOwner = "Nike Official"; batchNumber = "NK2024-AF1"; serialNumber = "NKE-AF1-2024-001"; warrantyInfo = "30-day return policy"; distributorName = "Nike Inc."; distributorContact = "consumer.affairs@nike.com"; distributorAddress = "1 Bowerman Drive, Beaverton, OR"; distributorCountry = "USA"; registeredAt = 1706745600000000000 },
    { id = "NIKE-AIR-JORDAN-1"; name = "Nike Air Jordan 1 Retro High"; manufacturer = "Nike Inc."; productionDate = "2024-01-20"; currentOwner = "Nike Official"; batchNumber = "NK2024-AJ1"; serialNumber = "NKE-AJ1-2024-001"; warrantyInfo = "30-day return policy"; distributorName = "Nike Inc."; distributorContact = "consumer.affairs@nike.com"; distributorAddress = "1 Bowerman Drive, Beaverton, OR"; distributorCountry = "USA"; registeredAt = 1705708800000000000 },
    { id = "NIKE-DUNK-LOW"; name = "Nike Dunk Low"; manufacturer = "Nike Inc."; productionDate = "2024-03-01"; currentOwner = "Nike Official"; batchNumber = "NK2024-DL"; serialNumber = "NKE-DL-2024-001"; warrantyInfo = "30-day return policy"; distributorName = "Nike Inc."; distributorContact = "consumer.affairs@nike.com"; distributorAddress = "1 Bowerman Drive, Beaverton, OR"; distributorCountry = "USA"; registeredAt = 1709251200000000000 },
    { id = "NIKE-AIR-MAX-PRO"; name = "Nike Air Max Pro"; manufacturer = "Nike Inc."; productionDate = "2024-01-10"; currentOwner = "Nike Official"; batchNumber = "NK2024-AMP"; serialNumber = "NKE-AMP-2024-001"; warrantyInfo = "30-day return policy"; distributorName = "Nike Inc."; distributorContact = "consumer.affairs@nike.com"; distributorAddress = "1 Bowerman Drive, Beaverton, OR"; distributorCountry = "USA"; registeredAt = 1704844800000000000 },
    // Adidas
    { id = "ADIDAS-ULTRABOOST-23"; name = "Adidas Ultraboost 23"; manufacturer = "Adidas AG"; productionDate = "2023-03-01"; currentOwner = "Adidas Authorized"; batchNumber = "ADS2023-UB23"; serialNumber = "ADS-UB23-2023-001"; warrantyInfo = "6-month warranty"; distributorName = "Adidas AG"; distributorContact = "service@adidas.com"; distributorAddress = "Adi-Dassler-Str. 1, Herzogenaurach"; distributorCountry = "Germany"; registeredAt = 1677628800000000000 },
    { id = "ADIDAS-YEEZY-350"; name = "Adidas Yeezy Boost 350 V2"; manufacturer = "Adidas AG"; productionDate = "2024-02-10"; currentOwner = "Adidas Authorized"; batchNumber = "ADS2024-YZ350"; serialNumber = "ADS-YZ350-2024-001"; warrantyInfo = "6-month warranty"; distributorName = "Adidas AG"; distributorContact = "service@adidas.com"; distributorAddress = "Adi-Dassler-Str. 1, Herzogenaurach"; distributorCountry = "Germany"; registeredAt = 1707523200000000000 },
    { id = "ADIDAS-STAN-SMITH"; name = "Adidas Stan Smith"; manufacturer = "Adidas AG"; productionDate = "2024-01-15"; currentOwner = "Adidas Authorized"; batchNumber = "ADS2024-SS"; serialNumber = "ADS-SS-2024-001"; warrantyInfo = "6-month warranty"; distributorName = "Adidas AG"; distributorContact = "service@adidas.com"; distributorAddress = "Adi-Dassler-Str. 1, Herzogenaurach"; distributorCountry = "Germany"; registeredAt = 1705276800000000000 },
    // Louis Vuitton
    { id = "LV-SPEEDY-30"; name = "Louis Vuitton Speedy 30"; manufacturer = "Louis Vuitton Malletier"; productionDate = "2023-10-01"; currentOwner = "LV Official"; batchNumber = "LV2023-SP30"; serialNumber = "TH1029"; warrantyInfo = "Lifetime authenticity guarantee"; distributorName = "Louis Vuitton Malletier"; distributorContact = "clientservice@lv.com"; distributorAddress = "2 Rue du Pont Neuf, Paris"; distributorCountry = "France"; registeredAt = 1696118400000000000 },
    { id = "LV-NEVERFULL-MM"; name = "Louis Vuitton Neverfull MM"; manufacturer = "Louis Vuitton Malletier"; productionDate = "2023-11-01"; currentOwner = "LV Official"; batchNumber = "LV2023-NF"; serialNumber = "SD2045"; warrantyInfo = "Lifetime authenticity guarantee"; distributorName = "Louis Vuitton Malletier"; distributorContact = "clientservice@lv.com"; distributorAddress = "2 Rue du Pont Neuf, Paris"; distributorCountry = "France"; registeredAt = 1698796800000000000 },
    // Gucci
    { id = "GUCCI-DIONYSUS-BAG"; name = "Gucci Dionysus Shoulder Bag"; manufacturer = "Gucci"; productionDate = "2023-09-15"; currentOwner = "Gucci Official"; batchNumber = "GCC2023-DION"; serialNumber = "GCC-DION-2023-001"; warrantyInfo = "2 year craftsmanship warranty"; distributorName = "Gucci S.p.A."; distributorContact = "clientservices@gucci.com"; distributorAddress = "Via Tornabuoni 73r, Florence"; distributorCountry = "Italy"; registeredAt = 1694736000000000000 },
    { id = "GUCCI-GG-BELT"; name = "Gucci GG Marmont Belt"; manufacturer = "Gucci"; productionDate = "2024-01-20"; currentOwner = "Gucci Official"; batchNumber = "GCC2024-BELT"; serialNumber = "GCC-BELT-2024-001"; warrantyInfo = "2 year craftsmanship warranty"; distributorName = "Gucci S.p.A."; distributorContact = "clientservices@gucci.com"; distributorAddress = "Via Tornabuoni 73r, Florence"; distributorCountry = "Italy"; registeredAt = 1705708800000000000 },
    // Rolex
    { id = "ROLEX-SUBMARINER"; name = "Rolex Submariner Date"; manufacturer = "Rolex SA"; productionDate = "2023-01-01"; currentOwner = "Rolex Authorized Dealer"; batchNumber = "ROL2023-SUB"; serialNumber = "2023C5X7901"; warrantyInfo = "5 year international guarantee"; distributorName = "Rolex SA"; distributorContact = "info@rolex.com"; distributorAddress = "Rue François-Dussaud 3-5, Geneva"; distributorCountry = "Switzerland"; registeredAt = 1672531200000000000 },
    { id = "ROLEX-DAYTONA"; name = "Rolex Cosmograph Daytona"; manufacturer = "Rolex SA"; productionDate = "2023-06-01"; currentOwner = "Rolex Authorized Dealer"; batchNumber = "ROL2023-DAY"; serialNumber = "2023F9K2034"; warrantyInfo = "5 year international guarantee"; distributorName = "Rolex SA"; distributorContact = "info@rolex.com"; distributorAddress = "Rue François-Dussaud 3-5, Geneva"; distributorCountry = "Switzerland"; registeredAt = 1685577600000000000 },
    { id = "ROLEX-GMT-MASTER"; name = "Rolex GMT-Master II"; manufacturer = "Rolex SA"; productionDate = "2023-09-01"; currentOwner = "Rolex Authorized Dealer"; batchNumber = "ROL2023-GMT"; serialNumber = "2023H3M5678"; warrantyInfo = "5 year international guarantee"; distributorName = "Rolex SA"; distributorContact = "info@rolex.com"; distributorAddress = "Rue François-Dussaud 3-5, Geneva"; distributorCountry = "Switzerland"; registeredAt = 1693526400000000000 },
    // Sony
    { id = "SONY-PS5"; name = "Sony PlayStation 5"; manufacturer = "Sony Interactive Entertainment"; productionDate = "2023-11-15"; currentOwner = "Sony Authorized"; batchNumber = "SNY2023-PS5"; serialNumber = "SNY-PS5-2023-001"; warrantyInfo = "1 year limited warranty"; distributorName = "Sony Interactive Entertainment"; distributorContact = "support@playstation.com"; distributorAddress = "2207 Bridgepointe Pkwy, San Mateo"; distributorCountry = "USA"; registeredAt = 1699920000000000000 },
    { id = "SONY-WH1000XM5"; name = "Sony WH-1000XM5 Headphones"; manufacturer = "Sony Corporation"; productionDate = "2023-08-01"; currentOwner = "Sony Authorized"; batchNumber = "SNY2023-WH5"; serialNumber = "SNY-WH5-2023-001"; warrantyInfo = "1 year limited warranty"; distributorName = "Sony Corporation"; distributorContact = "support@sony.com"; distributorAddress = "1-7-1 Konan, Minato-ku, Tokyo"; distributorCountry = "Japan"; registeredAt = 1690848000000000000 },
    // Ray-Ban
    { id = "RAYBAN-WAYFARER"; name = "Ray-Ban Wayfarer Classic"; manufacturer = "Luxottica Group"; productionDate = "2024-02-01"; currentOwner = "Ray-Ban Official"; batchNumber = "RB2024-WAY"; serialNumber = "RB-WAY-2024-001"; warrantyInfo = "2 year frame warranty"; distributorName = "EssilorLuxottica"; distributorContact = "customerservice@ray-ban.com"; distributorAddress = "Via Cantù 2, Milan"; distributorCountry = "Italy"; registeredAt = 1706745600000000000 },
    { id = "RAYBAN-AVIATOR"; name = "Ray-Ban Aviator Classic"; manufacturer = "Luxottica Group"; productionDate = "2024-01-15"; currentOwner = "Ray-Ban Official"; batchNumber = "RB2024-AVI"; serialNumber = "RB-AVI-2024-001"; warrantyInfo = "2 year frame warranty"; distributorName = "EssilorLuxottica"; distributorContact = "customerservice@ray-ban.com"; distributorAddress = "Via Cantù 2, Milan"; distributorCountry = "Italy"; registeredAt = 1705276800000000000 },
    // Puma
    { id = "PUMA-RS-X"; name = "Puma RS-X Sneakers"; manufacturer = "PUMA SE"; productionDate = "2024-01-20"; currentOwner = "Puma Authorized"; batchNumber = "PMA2024-RSX"; serialNumber = "PMA-RSX-2024-001"; warrantyInfo = "6-month warranty"; distributorName = "PUMA SE"; distributorContact = "service@puma.com"; distributorAddress = "PUMA Way 1, Herzogenaurach"; distributorCountry = "Germany"; registeredAt = 1705708800000000000 },
    // Under Armour
    { id = "UA-CURRY-11"; name = "Under Armour Curry 11"; manufacturer = "Under Armour Inc."; productionDate = "2024-02-15"; currentOwner = "UA Authorized"; batchNumber = "UA2024-CURRY11"; serialNumber = "UA-C11-2024-001"; warrantyInfo = "6-month warranty"; distributorName = "Under Armour Inc."; distributorContact = "support@underarmour.com"; distributorAddress = "1020 Hull St, Baltimore, MD"; distributorCountry = "USA"; registeredAt = 1707955200000000000 },
    // Chanel
    { id = "CHANEL-CLASSIC-FLAP"; name = "Chanel Classic Flap Bag"; manufacturer = "Chanel SAS"; productionDate = "2023-10-01"; currentOwner = "Chanel Official"; batchNumber = "CHL2023-CFB"; serialNumber = "32698457"; warrantyInfo = "Lifetime authenticity card"; distributorName = "Chanel SAS"; distributorContact = "clientservice@chanel.com"; distributorAddress = "135 Avenue Charles de Gaulle, Neuilly-sur-Seine"; distributorCountry = "France"; registeredAt = 1696118400000000000 },
    // Hermes
    { id = "HERMES-BIRKIN-30"; name = "Hermes Birkin 30"; manufacturer = "Hermès International"; productionDate = "2023-08-01"; currentOwner = "Hermes Official"; batchNumber = "HRM2023-BK30"; serialNumber = "Z-stamp-2023"; warrantyInfo = "Lifetime authenticity guarantee"; distributorName = "Hermès International"; distributorContact = "clientservice@hermes.com"; distributorAddress = "24 Rue du Faubourg Saint-Honoré, Paris"; distributorCountry = "France"; registeredAt = 1690848000000000000 },
    // New Balance
    { id = "NB-990V6"; name = "New Balance 990v6"; manufacturer = "New Balance Athletics"; productionDate = "2023-05-01"; currentOwner = "NB Authorized"; batchNumber = "NB2023-990V6"; serialNumber = "NB-990V6-2023-001"; warrantyInfo = "1 year limited warranty"; distributorName = "New Balance Athletics"; distributorContact = "newbalance@newbalance.com"; distributorAddress = "100 Guest Street, Boston, MA"; distributorCountry = "USA"; registeredAt = 1682899200000000000 },
    // Supreme
    { id = "SUPREME-BOX-LOGO-TEE"; name = "Supreme Box Logo Tee"; manufacturer = "Supreme LLC"; productionDate = "2024-02-01"; currentOwner = "Supreme Official"; batchNumber = "SUP2024-BLT"; serialNumber = "SUP-BLT-2024-001"; warrantyInfo = "No warranty"; distributorName = "Supreme LLC"; distributorContact = "support@supremenewyork.com"; distributorAddress = "274 Lafayette St, New York"; distributorCountry = "USA"; registeredAt = 1706745600000000000 },
    // Versace
    { id = "VERSACE-MEDUSA-BAG"; name = "Versace La Medusa Handbag"; manufacturer = "Gianni Versace S.r.l."; productionDate = "2023-11-01"; currentOwner = "Versace Official"; batchNumber = "VRS2023-MED"; serialNumber = "VRS-MED-2023-001"; warrantyInfo = "2 year craftsmanship warranty"; distributorName = "Gianni Versace S.r.l."; distributorContact = "clientservice@versace.com"; distributorAddress = "Via Gesù 12, Milan"; distributorCountry = "Italy"; registeredAt = 1698796800000000000 },
    // Oakley
    { id = "OAKLEY-HOLBROOK"; name = "Oakley Holbrook Sunglasses"; manufacturer = "Oakley Inc."; productionDate = "2024-01-10"; currentOwner = "Oakley Authorized"; batchNumber = "OAK2024-HB"; serialNumber = "OAK-HB-2024-001"; warrantyInfo = "2 year warranty"; distributorName = "EssilorLuxottica"; distributorContact = "support@oakley.com"; distributorAddress = "1 Icon, Foothill Ranch, CA"; distributorCountry = "USA"; registeredAt = 1704844800000000000 },
    // Legacy sample IDs for compatibility
    { id = "prd01"; name = "Smartphone X200"; manufacturer = "ElectroTech"; productionDate = "2023-11-15"; currentOwner = "ElectroTech Distributors"; batchNumber = "BTCH2023-11"; serialNumber = "SNX200-0001"; warrantyInfo = "2 years manufacturer warranty"; distributorName = "ElectroTech Distributors"; distributorContact = "contact@electrotech.com"; distributorAddress = "123 Tech Park, Silicon City"; distributorCountry = "USA"; registeredAt = 1700000000000000000 },
    { id = "prd02"; name = "Running Shoes ProFit"; manufacturer = "SuperSport"; productionDate = "2024-01-10"; currentOwner = "Athletic Emporium"; batchNumber = "SPRT2024-01"; serialNumber = "PFIT-2024-0101"; warrantyInfo = "6-month sole warranty"; distributorName = "Athletic Emporium"; distributorContact = "sales@athleticemporium.com"; distributorAddress = "456 Fitness Blvd, Sportstown"; distributorCountry = "Germany"; registeredAt = 1700000000000000000 },
    { id = "VP-001"; name = "VeriProduct Sample Item"; manufacturer = "VeriProduct Labs"; productionDate = "2024-01-01"; currentOwner = "VeriProduct"; batchNumber = "VP2024-001"; serialNumber = "VP-SAMPLE-001"; warrantyInfo = "Demo product"; distributorName = "VeriProduct Distribution"; distributorContact = "info@veriproduct.com"; distributorAddress = "1 Blockchain Ave, Crypto City"; distributorCountry = "Global"; registeredAt = 1700000000000000000 },
  ];

  for (product in sampleProducts.values()) {
    products.add(product.id, product);
  };

  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the system");
    };
    // Products already seeded at startup
  };

  public shared ({ caller }) func registerProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can register products");
    };
    if (products.containsKey(product.id)) {
      Runtime.trap("Product already exists");
    };
    let newProduct : Product = { product with registeredAt = Time.now() };
    products.add(product.id, newProduct);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(product.id)) {
      Runtime.trap("Product does not exist");
    };
    let updatedProduct : Product = { product with registeredAt = Time.now() };
    products.add(product.id, updatedProduct);
  };

  public shared ({ caller }) func removeProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    if (not products.containsKey(productId)) {
      Runtime.trap("Product does not exist");
    };
    products.remove(productId);
  };

  public query (_) func getProduct(productId : Text) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query (_) func listProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query (_) func verifyProduct(searchTerm : Text) : async VerificationResult {
    let lowerSearch = searchTerm.toLower();

    // 1. Exact ID match → genuine
    switch (products.get(searchTerm)) {
      case (?product) {
        return {
          status = "genuine";
          matchedProductDetails = ?product;
          originalProductDetails = null;
          reason = "Exact product ID match. This product is verified as genuine.";
          fakeIndicators = [];
        };
      };
      case (null) {};
    };

    // 2. Fuzzy name/brand match
    let bestMatch = products.toArray().find(
      func((_, p)) {
        p.name.toLower().contains(#text lowerSearch) or
        p.manufacturer.toLower().contains(#text lowerSearch) or
        p.id.toLower().contains(#text lowerSearch)
      }
    );

    switch (bestMatch) {
      case (?(_, product)) {
        // Found a genuine version – the search term may be a variant/fake
        let isExactName = product.name.toLower() == lowerSearch;
        if (isExactName) {
          return {
            status = "genuine";
            matchedProductDetails = ?product;
            originalProductDetails = null;
            reason = "Exact product name match. This product is verified as genuine.";
            fakeIndicators = [];
          };
        } else {
          return {
            status = "fake";
            matchedProductDetails = null;
            originalProductDetails = ?product;
            reason = "The product you entered does not exactly match any registered item. A similar genuine product was found in our registry — this may be a counterfeit or variant.";
            fakeIndicators = [
              "Product name does not exactly match registry records",
              "No verified serial number on file for this variant",
              "Purchase only from authorized distributors listed below",
              "Check hologram / authentication tag on the genuine product",
            ];
          };
        };
      };
      case (null) {
        return {
          status = "not found";
          matchedProductDetails = null;
          originalProductDetails = null;
          reason = "This product is not in our blockchain registry. It may be counterfeit, unregistered, or the name may be misspelled.";
          fakeIndicators = [
            "Not found in any registered product database",
            "Cannot verify manufacturer or distributor",
            "Exercise caution before purchasing",
          ];
        };
      };
    };
  };

  public shared ({ caller }) func recordVerification(searchTerm : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record verifications");
    };
    let log = {
      productSearched = searchTerm;
      resultStatus = status;
      timestamp = Time.now();
    };
    verificationLogs.add(Time.now(), log);
  };

  public query ({ caller }) func getVerificationHistory() : async [VerificationLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view verification history");
    };
    let allLogs = verificationLogs.values().toArray();
    let logsCount = allLogs.size();
    if (logsCount <= 50) { allLogs } else { allLogs.sliceToArray(if (logsCount > 50) (logsCount - 50 : Nat) else 0, logsCount) };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
