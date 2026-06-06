/* Kazmi Cellars site search — vanilla, client-side, no dependencies.
   Adds a top-right search button + overlay (Cmd/Ctrl+K or "/").
   Indexes: 20 grapes, 26 regions, 16 cuisines, 170 dishes, 6 tools, 33 aroma profiles,
   plus data/{wineries,regions,restaurants,bottles,posts}.json (loaded lazily).
*/
(function () {
  if (window.__kcSearch) return;
  window.__kcSearch = true;

  function slugify(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function collectStrings(obj, depth, out) {
    out = out || []; depth = depth || 0;
    if (depth > 3 || obj == null) return out;
    if (typeof obj === 'string') { out.push(obj); return out; }
    if (Array.isArray(obj)) { obj.forEach(v => collectStrings(v, depth + 1, out)); return out; }
    if (typeof obj === 'object') Object.values(obj).forEach(v => collectStrings(v, depth + 1, out));
    return out;
  }

  const GRAPES_INDEX = [
    {slug:"pinot-noir", name:"Pinot Noir", origin:"Burgundy, France", synonyms:"Spätburgunder (Germany) · Pinot Nero (Italy)", tagline:"The world's most obsessed-over red · Thin-skinned · Terroir-transparent · Ancient"},
    {slug:"cabernet-sauvignon", name:"Cabernet Sauvignon", origin:"Bordeaux, France", synonyms:"Cab Sauv · Bouchet (historical)", tagline:"World's most planted fine wine grape · Age-worthy · Structured"},
    {slug:"merlot", name:"Merlot", origin:"Bordeaux, France", synonyms:"Bigney (historical)", tagline:"World's most planted red · Plush · Approachable · Underrated"},
    {slug:"syrah-shiraz", name:"Syrah / Shiraz", origin:"Northern Rhône, France", synonyms:"Syrah (cool climate) · Shiraz (Australia/warm)", tagline:"One grape · two personalities · Climate defines everything"},
    {slug:"grenache", name:"Grenache", origin:"Southern France / Aragon, Spain", synonyms:"Garnacha (Spain) · Cannonau (Sardinia)", tagline:"World's second most planted red · Mediterranean · Warm · Spiced"},
    {slug:"tempranillo", name:"Tempranillo", origin:"Rioja, Spain", synonyms:"Tinto Fino · Aragonez (Portugal) · Cencibel · Ull de Llebre", tagline:"Spain's flagship red · Oak-loving · Named 'little early one'"},
    {slug:"sangiovese", name:"Sangiovese", origin:"Tuscany, Italy", synonyms:"Brunello · Prugnolo Gentile · Morellino · Nielluccio (Corsica)", tagline:"Italy's most planted red · Born for food · Defines Tuscany"},
    {slug:"nebbiolo", name:"Nebbiolo", origin:"Piedmont, Italy", synonyms:"Spanna · Chiavennasca (Valtellina) · Picotèner", tagline:"The King of wines · Never open early · Tar and roses"},
    {slug:"malbec", name:"Malbec", origin:"Cahors, France", synonyms:"Côt (Loire) · Auxerrois (Cahors) · Pressac", tagline:"From French obscurity to Argentina's national grape"},
    {slug:"cabernet-franc", name:"Cabernet Franc", origin:"Loire Valley / Bordeaux, France", synonyms:"Breton (Loire) · Bouchet (Saint-Émilion) · Carmenet", tagline:"Parent of Cabernet Sauvignon · Loire's great red · Aromatic"},
    {slug:"mourvedre", name:"Mourvèdre", origin:"Provence / Murcia, France & Spain", synonyms:"Monastrell (Spain) · Mataro (Australia/California)", tagline:"The M in GSM · Bandol's soul · Needs serious food"},
    {slug:"gamay", name:"Gamay", origin:"Beaujolais, France", synonyms:"Gamay Noir à Jus Blanc", tagline:"Wine's most misunderstood grape · Serve chilled · Cru Gamay is serious"},
    {slug:"chardonnay", name:"Chardonnay", origin:"Burgundy, France", synonyms:"White Burgundy · Chablis · Pouilly-Fuissé", tagline:"World's most planted white · The chameleon grape · Oak defines everything"},
    {slug:"sauvignon-blanc", name:"Sauvignon Blanc", origin:"Loire Valley, France", synonyms:"Fumé Blanc (California) · Blanc Fumé (Loire)", tagline:"Electric acidity · The most instantly recognizable white"},
    {slug:"riesling", name:"Riesling", origin:"Rhine / Mosel, Germany", synonyms:"Most misunderstood great grape in the world", tagline:"Dry to lusciously sweet · Petrol with age · Ages magnificently"},
    {slug:"viognier", name:"Viognier", origin:"Condrieu, Northern Rhône, France", synonyms:"Condrieu AOC · Château-Grillet", tagline:"Nearly extinct in the 1960s · The most perfumed white · Drink young"},
    {slug:"chenin-blanc", name:"Chenin Blanc", origin:"Loire Valley, France", synonyms:"Steen (South Africa) · Pineau de la Loire", tagline:"Most versatile white grape · Bone dry to dessert · Ages magnificently"},
    {slug:"albarino", name:"Albariño", origin:"Rías Baixas, Galicia, Spain", synonyms:"Alvarinho (Vinho Verde, Portugal)", tagline:"Spain's great seafood white · Saline · Atlantic · Born for the ocean"},
    {slug:"gruner-veltliner", name:"Grüner Veltliner", origin:"Wachau, Austria", synonyms:"GrüVe · Grüner", tagline:"Austria's soul grape · White pepper fingerprint · Works with asparagus"},
    {slug:"assyrtiko", name:"Assyrtiko", origin:"Santorini, Greece", synonyms:"Santorini's soul · Asyrtiko", tagline:"Volcanic · Saline · Electric acidity · Ungrafted ancient vines"}
  ];
  const REGIONS_INDEX = [
    {slug:"bordeaux-left-bank", name:"Bordeaux — Left Bank", country:"France", tagline:"The world's most famous wine region · Cabernet country · Built to age"},
    {slug:"bordeaux-right-bank", name:"Bordeaux — Right Bank", country:"France", tagline:"Merlot's spiritual home · Pétrus · Clay over limestone"},
    {slug:"burgundy-cote-d-or", name:"Burgundy — Côte d'Or", country:"France", tagline:"The world's most compelling terroir argument · Pinot Noir + Chardonnay only"},
    {slug:"champagne", name:"Champagne", country:"France", tagline:"The world's greatest sparkling wine · Chalk · The northernmost great region"},
    {slug:"northern-rhone", name:"Northern Rhône", country:"France", tagline:"Syrah's spiritual home · Granite slopes · Iron and violets"},
    {slug:"southern-rhone", name:"Southern Rhône", country:"France", tagline:"GSM blends · Garrigue · Galets Roulés · The sun-drenched south"},
    {slug:"loire-valley", name:"Loire Valley", country:"France", tagline:"France's garden river · Chenin · Sauvignon · Cab Franc · 1000km of variety"},
    {slug:"alsace", name:"Alsace", country:"France", tagline:"Germany's grapes · France's cuisine · The most aromatic whites in the world"},
    {slug:"piedmont", name:"Piedmont", country:"Italy", tagline:"Barolo · Barbaresco · Nebbiolo · The King and Queen of Italian wine"},
    {slug:"tuscany", name:"Tuscany", country:"Italy", tagline:"Sangiovese · Brunello · Chianti · Super Tuscans · Italy's wine heartland"},
    {slug:"veneto-amarone", name:"Veneto & Amarone", country:"Italy", tagline:"Amarone · Valpolicella · Italy's appassimento masters"},
    {slug:"rioja", name:"Rioja", country:"Spain", tagline:"Spain's most famous red · American oak · Tempranillo · Crianza to Gran Reserva"},
    {slug:"ribera-del-duero", name:"Ribera del Duero", country:"Spain", tagline:"Spain's highest plateau · Extreme diurnal range · Vega Sicilia country"},
    {slug:"priorat", name:"Priorat", country:"Spain", tagline:"Llicorella slate · Tiny yields · Spain's most dramatic landscape"},
    {slug:"rias-baixas", name:"Rías Baixas", country:"Spain", tagline:"Albariño · Atlantic winds · The greenest corner of Spain · Seafood country"},
    {slug:"mosel", name:"Mosel", country:"Germany", tagline:"World's finest Riesling · Blue Devonian slate · Impossibly steep slopes"},
    {slug:"wachau-kamptal", name:"Wachau & Kamptal", country:"Austria", tagline:"Europe's oldest rocks · Danube carved · Grüner Veltliner + Riesling"},
    {slug:"napa-valley", name:"Napa Valley", country:"USA", tagline:"California's most famous valley · Cabernet King · 1976 Judgment of Paris"},
    {slug:"santa-barbara-county", name:"Santa Barbara County", country:"USA", tagline:"Transverse valleys · Pacific direct access · California's coolest south · Burgundian soul"},
    {slug:"willamette-valley", name:"Willamette Valley", country:"USA", tagline:"Oregon's great Pinot Noir · Jory volcanic soil · America's Burgundy"},
    {slug:"barossa-valley", name:"Barossa Valley", country:"Australia", tagline:"World's oldest vines · Barossa Shiraz · 150-year-old ungrafted bush vines"},
    {slug:"margaret-river", name:"Margaret River", country:"Australia", tagline:"Western Australia's finest · Cabernet-Merlot · Indian Ocean influence"},
    {slug:"marlborough", name:"Marlborough", country:"New Zealand", tagline:"Sauvignon Blanc capital of the world · Cloudy Bay · UV intensity"},
    {slug:"mendoza-uco-valley", name:"Mendoza — Uco Valley", country:"Argentina", tagline:"High altitude Malbec · Andes snowmelt · UV intensity at 1,000m+"},
    {slug:"santorini", name:"Santorini", country:"Greece", tagline:"Volcanic island · Basket-trained vines · Phylloxera-free · Ancient ungrafted vines"},
    {slug:"douro-valley", name:"Douro Valley", country:"Portugal", tagline:"Port's birthplace · Ancient schist terraces · Some of the world's oldest wine culture"}
  ];
  const CUISINES_INDEX = [
    {slug:"italian", name:"Italian", desc:"Tomato, olive oil, aged cheese, cured meat — built around Sangiovese and the sea", dishnames:"Bistecca Fiorentina, Cacio e Pepe, Osso Buco, Margherita Pizza, Seafood Risotto, Vitello Tonnato, Saltimbocca alla Romana, Ribollita, Tiramisu, Pasta alla Norma"},
    {slug:"french", name:"French", desc:"Butter, cream, wine in cooking — the world's most wine-integrated cuisine", dishnames:"Coq au Vin, Bouillabaisse, Duck Confit, Steak Frites, Moules Marinières, Boeuf Bourguignon, Croque Monsieur, Ratatouille, Crème Brûlée, Soupe à l'Oignon"},
    {slug:"spanish", name:"Spanish", desc:"Olive oil, jamón, paprika, saffron — wine is inseparable from Spanish food culture", dishnames:"Jamón Ibérico, Paella Valenciana, Pulpo a la Gallega, Gazpacho, Cochinillo Asado, Gambas al Ajillo, Tortilla Española, Chorizo al Vino, Patatas Bravas, Churros con Chocolate"},
    {slug:"german", name:"German", desc:"Pork, sauerkraut, sausage, dumplings — hearty and wine-friendlier than you'd think", dishnames:"Wiener Schnitzel, Sauerbraten, Bratwurst mit Sauerkraut, Flammkuchen, Maultaschen, Rinderrouladen, Schwarzwälder Kirschtorte, Zwiebelkuchen, Kartoffelsuppe, Lebkuchen"},
    {slug:"british", name:"British", desc:"Roasts, pies, fish, great cheese — far more wine-friendly than its reputation suggests", dishnames:"Fish and Chips, Sunday Roast (Beef), Beef Wellington, Shepherd's Pie, Ploughman's Lunch, Sticky Toffee Pudding, Welsh Rarebit, Lamb Chops, Mint Sauce, Full English Breakfast, Scotch Egg"},
    {slug:"greek", name:"Greek", desc:"Olive oil, lemon, herbs, lamb, seafood — the Mediterranean diet in its purest form", dishnames:"Grilled Octopus, Moussaka, Souvlaki with Tzatziki, Kleftiko, Spanakopita, Taramasalata, Saganaki, Gemista, Fasolada, Baklava"},
    {slug:"middle-eastern", name:"Middle Eastern", desc:"Za'atar, pomegranate, lamb, chickpeas, warm spice — ancient food cultures from Levant to Gulf", dishnames:"Hummus & Warm Pita, Lamb Kofta, Chicken Shawarma, Fattoush, Mansaf, Falafel in Pita, Moroccan Lamb Tagine, Kibbeh, Mixed Meze, Baklava"},
    {slug:"indian-pakistani", name:"Indian/Pakistani", desc:"Spice, aromatics, ghee, lentils, clay ovens — wines must bridge heat without fighting it", dishnames:"Butter Chicken, Biryani (Lamb), Saag Paneer, Tandoori Chicken, Dal Tadka, Lamb Korma, Nihari, Seekh Kebab, Haleem, Kheer"},
    {slug:"thai", name:"Thai", desc:"Lemongrass, galangal, coconut milk, fish sauce, chili — the world's most complex flavour system", dishnames:"Pad Thai, Green Curry, Tom Yum Soup, Massaman Curry, Som Tam, Larb, Pad Krapow, Mango Sticky Rice, Tod Mun Pla, Red Curry with Duck"},
    {slug:"vietnamese", name:"Vietnamese", desc:"Herbs, fish sauce, lime, rice paper, fragrant broths — light, fresh and wine-friendly", dishnames:"Pho Bo, Bánh Mì, Gỏi Cuốn, Bò Lúc Lắc, Bánh Xèo, Cơm Tấm, Chả Cá, Bún Chả, Cao Lầu, Bún Bò Huế"},
    {slug:"chinese", name:"Chinese", desc:"Dim sum, roasted meats, Sichuan spice, Cantonese delicacy — China's vast regional food cultures", dishnames:"Peking Duck, Dim Sum, Kung Pao Chicken, Mapo Tofu, Char Siu, Cantonese Steamed Fish, Xiaolongbao, Sweet & Sour Pork, Yangzhou Fried Rice, Sichuan Hot Pot"},
    {slug:"japanese", name:"Japanese", desc:"Precision, umami, dashi, miso, soy — Japanese food rewards the finest, most delicate wines", dishnames:"Omakase Sushi, Wagyu Teppanyaki, Tonkotsu Ramen, Tempura, Yakitori, Miso Black Cod, Gyoza, Shabu-Shabu, Katsu Curry, Matcha Desserts"},
    {slug:"korean", name:"Korean", desc:"Fermented kimchi, gochujang, sesame, BBQ smoke — bold, complex and wine-challenging", dishnames:"Korean BBQ, Bibimbap, Kimchi Jjigae, Bulgogi, Japchae, Sundubu Jjigae, Dakgalbi, Samgyetang, Jeon, Hotteok"},
    {slug:"mexican", name:"Mexican", desc:"Chili, lime, corn, slow-cooked meat, mole — one of the world's most complex spice traditions", dishnames:"Mole Poblano, Tacos al Pastor, Ceviche, Birria, Enchiladas Verdes, Carnitas, Pozole Rojo, Tamales, Chiles en Nogada, Churros con Chocolate"},
    {slug:"around-the-world", name:"Around the World", desc:"Jerk chicken, injera, asado, ceviche — global classics that deserve proper wine matches", dishnames:"Jerk Chicken, Peri Peri Chicken, Doro Wat, Moroccan Lamb Tagine, Argentine Asado, Brazilian Feijoada, Peruvian Ceviche, South African Braai, Georgian Khinkali, West African Groundnut Soup"},
    {slug:"desserts-of-the-world", name:"Desserts of the World", desc:"20 great desserts — and the wines that make them sing", dishnames:"Crème Brûlée, Pavlova, Gulab Jamun, Tres Leches Cake, Pastel de Nata, Panna Cotta, New York Cheesecake, Brigadeiro, Mooncake, Kanafeh, Bingsu, Kouign-Amann, Rum Cake, Apple Strudel, Profiteroles, Banoffee Pie, Mochi Ice Cream, Crème Caramel, Basbousa, Kulfi"}
  ];
  const DISHES_INDEX = [
    {cuisine:"Italian", name:"Bistecca Fiorentina", desc:"Thick-cut T-bone grilled over charcoal, served rare", flavors:"Rich, Umami, Charred", wines:"Brunello di Montalcino, Châteauneuf-du-Pape, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Italian", name:"Cacio e Pepe", desc:"Pasta, Pecorino Romano, black pepper — nothing else", flavors:"Savoury, Peppery, Rich", wines:"Vermentino di Sardegna, Grüner Veltliner, Wachau, Pecorino DOC, Abruzzo"},
    {cuisine:"Italian", name:"Osso Buco", desc:"Braised veal shank with gremolata and saffron risotto", flavors:"Rich, Braised, Savoury", wines:"Barolo, Barbera d'Asti, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Italian", name:"Margherita Pizza", desc:"San Marzano tomato, fior di latte mozzarella, fresh basil", flavors:"Bright, Acidic, Herbal", wines:"Chianti Classico, Lambrusco di Sorbara, Santa Ynez Valley Chardonnay, Santa Barbara"},
    {cuisine:"Italian", name:"Seafood Risotto", desc:"Creamy Arborio with mixed shellfish, white wine, parmesan", flavors:"Rich, Delicate, Creamy", wines:"Soave Classico, Chablis Premier Cru, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Italian", name:"Vitello Tonnato", desc:"Cold poached veal with tuna-caper cream — Piemontese classic", flavors:"Delicate, Umami, Savoury", wines:"Gavi di Gavi, Champagne Blanc de Blancs, Santa Barbara County Chardonnay"},
    {cuisine:"Italian", name:"Saltimbocca alla Romana", desc:"Veal escalope, prosciutto, sage, white wine pan sauce", flavors:"Savoury, Herbal, Light", wines:"Frascati Superiore, Grüner Veltliner, Kamptal, Qupé Viognier, Santa Barbara"},
    {cuisine:"Italian", name:"Ribollita", desc:"Thick Tuscan bread-and-bean soup with cavolo nero", flavors:"Earthy, Rich, Hearty", wines:"Chianti, Côtes du Rhône, Santa Barbara County Grenache"},
    {cuisine:"Italian", name:"Tiramisu", desc:"Espresso-soaked ladyfingers, mascarpone cream, cocoa", flavors:"Sweet, Coffee, Rich", wines:"Moscato d'Asti, Vin Santo del Chianti, Brachetto d'Acqui"},
    {cuisine:"Italian", name:"Pasta alla Norma", desc:"Eggplant, San Marzano tomato, basil, ricotta salata", flavors:"Acidic, Earthy, Herbal", wines:"Nero d'Avola, Côtes du Rhône Rouge, Santa Ynez Valley Syrah, Santa Barbara"},
    {cuisine:"French", name:"Coq au Vin", desc:"Chicken slow-braised in Burgundy with mushrooms, lardons, onions", flavors:"Rich, Earthy, Braised", wines:"Burgundy Pinot Noir, Côtes du Rhône Rouge, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"French", name:"Bouillabaisse", desc:"Provençal fisherman's stew with saffron, fennel, rouille croutons", flavors:"Savoury, Herbal, Seafood", wines:"Provence Rosé, Picpoul de Pinet, Santa Barbara County Grenache Rosé"},
    {cuisine:"French", name:"Duck Confit", desc:"Duck leg slow-cooked in its own fat, skin crisped", flavors:"Rich, Fatty, Savoury", wines:"Cahors Malbec, Madiran, Tannat, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"French", name:"Steak Frites", desc:"Bistro entrecôte with crispy fries and béarnaise or shallot butter", flavors:"Rich, Umami, Classic", wines:"Bordeaux, Médoc Cabernet, Côtes du Rhône Villages, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"French", name:"Moules Marinières", desc:"Mussels steamed in white wine, shallots, parsley, butter", flavors:"Saline, Delicate, Bright", wines:"Muscadet Sèvre et Maine, Chablis, Santa Barbara County Albariño"},
    {cuisine:"French", name:"Boeuf Bourguignon", desc:"Beef braised for hours in Burgundy with carrots, mushrooms, lardons", flavors:"Rich, Earthy, Braised", wines:"Gevrey-Chambertin, Barbera d'Asti, Piemonte, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"French", name:"Croque Monsieur", desc:"Toasted ham and Gruyère with Mornay sauce", flavors:"Savoury, Cheesy, Rich", wines:"Champagne Brut, Alsace Riesling, Santa Ynez Valley Chardonnay, Santa Barbara"},
    {cuisine:"French", name:"Ratatouille", desc:"Slow-roasted Provençal vegetables — tomato, courgette, aubergine, pepper", flavors:"Herbal, Bright, Earthy", wines:"Provence Rosé, Grenache Blanc, Roussillon, Santa Barbara County Grenache Rosé"},
    {cuisine:"French", name:"Crème Brûlée", desc:"Vanilla custard with caramelised sugar crust", flavors:"Sweet, Creamy, Vanilla", wines:"Sauternes, Tokaji Aszú 5 Puttonyos, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"French", name:"Soupe à l'Oignon", desc:"Rich caramelised onion broth, Gruyère crouton, from the oven", flavors:"Rich, Savoury, Umami", wines:"Alsace Pinot Gris, Beaujolais Cru, Morgon, Santa Barbara Grenache, Santa Ynez Valley"},
    {cuisine:"Spanish", name:"Jamón Ibérico", desc:"Acorn-fed Iberian cured ham, sliced paper-thin", flavors:"Savoury, Fatty, Umami", wines:"Fino Sherry, Manzanilla, Sanlúcar, Cava Gran Reserva, Penedès"},
    {cuisine:"Spanish", name:"Paella Valenciana", desc:"Saffron rice with chicken, rabbit, green beans — the original", flavors:"Savoury, Aromatic, Earthy", wines:"Rioja Rosado, Albariño, Rías Baixas, Santa Barbara County Albariño"},
    {cuisine:"Spanish", name:"Pulpo a la Gallega", desc:"Boiled octopus, olive oil, paprika, sea salt on wood", flavors:"Saline, Smoky, Delicate", wines:"Albariño, Rías Baixas, Godello, Valdeorras, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Spanish", name:"Gazpacho", desc:"Cold Andalusian tomato soup with cucumber, pepper, garlic, sherry vinegar", flavors:"Bright, Acidic, Refreshing", wines:"Manzanilla Sherry, Verdejo, Rueda, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Spanish", name:"Cochinillo Asado", desc:"Segovian roasted suckling pig — impossibly crispy skin", flavors:"Rich, Fatty, Savoury", wines:"Ribera del Duero Crianza, Rioja Gran Reserva, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Spanish", name:"Gambas al Ajillo", desc:"Prawns sizzling in olive oil with garlic, chili, sherry", flavors:"Savoury, Saline, Spicy", wines:"Albariño, Rías Baixas, Fino Sherry, Santa Barbara County Albariño"},
    {cuisine:"Spanish", name:"Tortilla Española", desc:"Thick potato and egg omelette — simple and perfect", flavors:"Rich, Creamy, Classic", wines:"Rioja Blanco (aged), Cava Brut, Santa Maria Valley Chardonnay, Santa Barbara"},
    {cuisine:"Spanish", name:"Chorizo al Vino", desc:"Chorizo braised in red wine with smoked paprika", flavors:"Smoky, Spicy, Rich", wines:"Garnacha, Campo de Borja, Rioja Crianza, Santa Barbara County Grenache"},
    {cuisine:"Spanish", name:"Patatas Bravas", desc:"Crispy fried potatoes with spicy tomato sauce and aioli", flavors:"Spicy, Crispy, Bright", wines:"Rioja Joven, Cava Brut, Santa Ynez Valley Grenache Rosé, Santa Barbara"},
    {cuisine:"Spanish", name:"Churros con Chocolate", desc:"Fried dough with thick dark drinking chocolate", flavors:"Sweet, Rich, Indulgent", wines:"Pedro Ximénez Sherry, Brachetto d'Acqui, Orange Muscat, California"},
    {cuisine:"German", name:"Wiener Schnitzel", desc:"Thin veal cutlet, breadcrumbed and fried in clarified butter", flavors:"Crispy, Rich, Classic", wines:"Grüner Veltliner Smaragd, Wachau, Riesling Spätlese, Mosel, Santa Maria Valley Chardonnay, Santa Barbara"},
    {cuisine:"German", name:"Sauerbraten", desc:"Beef marinated for days in vinegar and spices, then braised", flavors:"Tangy, Rich, Sweet-Sour", wines:"Spätburgunder, Baden, Lemberger, Württemberg, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"German", name:"Bratwurst mit Sauerkraut", desc:"Grilled pork sausage with fermented cabbage", flavors:"Savoury, Tangy, Smoky", wines:"Riesling Kabinett, Mosel, Silvaner, Franken, Weissburgunder (Pinot Blanc), Alsace"},
    {cuisine:"German", name:"Flammkuchen", desc:"Thin Alsatian tart with crème fraîche, caramelised onion, lardons", flavors:"Rich, Savoury, Crispy", wines:"Alsace Riesling, Crémant d'Alsace, Pinot Gris, Alsace"},
    {cuisine:"German", name:"Maultaschen", desc:"German pasta pockets filled with minced meat, spinach, herbs in broth", flavors:"Delicate, Savoury, Herbal", wines:"Trollinger, Württemberg, Riesling (dry), Rheingau, Pinot Grigio, Friuli"},
    {cuisine:"German", name:"Rinderrouladen", desc:"Rolled beef with mustard, bacon, onion and pickle inside", flavors:"Rich, Tangy, Savoury", wines:"Dornfelder, Rheinhessen, Spätburgunder, Ahr, Barbera d'Asti, Piemonte"},
    {cuisine:"German", name:"Schwarzwälder Kirschtorte", desc:"Black Forest cake — chocolate sponge, kirsch cherries, whipped cream", flavors:"Sweet, Chocolate, Cherry", wines:"Spätburgunder (off-dry), Baden, Brachetto d'Acqui, Piemonte, Orange Muscat, California"},
    {cuisine:"German", name:"Zwiebelkuchen", desc:"German onion tart with bacon and caraway — autumn harvest classic", flavors:"Savoury, Rich, Seasonal", wines:"Silvaner, Franken, Riesling Spätlese, Pfalz, Pinot Gris, Alsace"},
    {cuisine:"German", name:"Kartoffelsuppe", desc:"German potato soup with bacon, chives and a swirl of cream", flavors:"Rich, Earthy, Creamy", wines:"Silvaner, Franken, Pinot Gris, Alsace, Santa Maria Valley Chardonnay, Santa Barbara"},
    {cuisine:"German", name:"Lebkuchen", desc:"Spiced German gingerbread — clove, cinnamon, anise, honey", flavors:"Sweet, Spiced, Festive", wines:"Riesling Auslese, Rheingau, Gewurztraminer Vendange Tardive, Alsace, Orange Muscat, California"},
    {cuisine:"British", name:"Fish and Chips", desc:"Beer-battered cod with thick chips and mushy peas", flavors:"Crispy, Fatty, Saline", wines:"Chablis Premier Cru, Muscadet Sèvre et Maine, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"British", name:"Sunday Roast (Beef)", desc:"Sirloin or ribeye, Yorkshire pudding, roast potatoes, gravy", flavors:"Rich, Savoury, Classic", wines:"Bordeaux, Saint-Julien, Rioja Reserva, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"British", name:"Beef Wellington", desc:"Beef fillet in pâté, duxelles and puff pastry", flavors:"Rich, Earthy, Indulgent", wines:"Pomerol, Merlot, Gevrey-Chambertin, Burgundy, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"British", name:"Shepherd's Pie", desc:"Minced lamb with vegetables under a golden mashed potato crust", flavors:"Rich, Earthy, Hearty", wines:"Côtes du Rhône, Merlot, Saint-Émilion, Santa Ynez Valley Grenache, Santa Barbara"},
    {cuisine:"British", name:"Ploughman's Lunch", desc:"Mature cheddar, Branston pickle, crusty bread, pickled onion", flavors:"Tangy, Savoury, Rustic", wines:"Chenin Blanc (dry), Loire, Chablis, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"British", name:"Sticky Toffee Pudding", desc:"Toffee sponge with cream — Britain's most indulgent pudding", flavors:"Sweet, Caramel, Rich", wines:"Sauternes, Tawny Port, 20 year, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"British", name:"Welsh Rarebit", desc:"Sharp Cheddar and ale sauce grilled on toast", flavors:"Savoury, Cheesy, Tangy", wines:"Chablis, Sauvignon Blanc, Sancerre, Santa Ynez Valley Chardonnay, Santa Barbara"},
    {cuisine:"British", name:"Lamb Chops, Mint Sauce", desc:"Grilled rack of lamb, classic British mint sauce, roast veg", flavors:"Rich, Herbal, Savoury", wines:"Bordeaux, Pauillac, Rioja Reserva, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"British", name:"Full English Breakfast", desc:"Eggs, bacon, sausage, beans, black pudding, grilled tomato", flavors:"Rich, Savoury, Indulgent", wines:"Champagne Brut, Cava Brut, Santa Barbara County Sparkling Rosé"},
    {cuisine:"British", name:"Scotch Egg", desc:"Soft-boiled egg wrapped in sausagemeat, breadcrumbed and fried", flavors:"Rich, Savoury, Crispy", wines:"Riesling (dry), Alsace, Champagne Brut, Santa Barbara County Pinot Gris"},
    {cuisine:"Greek", name:"Grilled Octopus", desc:"Sun-dried then chargrilled octopus with olive oil and lemon", flavors:"Saline, Smoky, Delicate", wines:"Assyrtiko, Santorini, Albariño, Rías Baixas, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Greek", name:"Moussaka", desc:"Layered eggplant, spiced lamb mince, béchamel — baked golden", flavors:"Rich, Spiced, Earthy", wines:"Xinomavro, Naoussa, Agiorgitiko, Nemea, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Greek", name:"Souvlaki with Tzatziki", desc:"Grilled pork skewers, warm pita, creamy tzatziki, tomato, red onion", flavors:"Herbal, Tangy, Charred", wines:"Assyrtiko, Santorini, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Greek", name:"Kleftiko", desc:"Lamb slow-cooked in parchment with lemon, garlic, herbs for hours", flavors:"Rich, Herbal, Tender", wines:"Xinomavro, Naoussa, Agiorgitiko, Nemea, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Greek", name:"Spanakopita", desc:"Crispy filo filled with spinach, feta and spring onion", flavors:"Savoury, Herbal, Salty", wines:"Assyrtiko (dry), Sauvignon Blanc, Sancerre, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Greek", name:"Taramasalata", desc:"Creamy smoked carp roe with lemon and olive oil", flavors:"Saline, Rich, Smoky", wines:"Assyrtiko, Santorini, Muscadet Sèvre et Maine, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Greek", name:"Saganaki", desc:"Pan-fried graviera cheese, flambéed with brandy", flavors:"Rich, Salty, Caramelised", wines:"Assyrtiko (dry), Champagne Brut, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Greek", name:"Gemista", desc:"Tomatoes and peppers stuffed with rice, herbs, olive oil — baked", flavors:"Bright, Herbal, Earthy", wines:"Grenache Rosé, Provence, Sauvignon Blanc, Marlborough, Santa Barbara County Grenache Rosé"},
    {cuisine:"Greek", name:"Fasolada", desc:"Greek white bean soup with tomato, olive oil, herbs — the national dish", flavors:"Earthy, Herbal, Simple", wines:"Sauvignon Blanc, Loire, Grüner Veltliner, Wachau, Vermentino, Sardinia"},
    {cuisine:"Greek", name:"Baklava", desc:"Filo pastry layered with pistachio and walnut, soaked in rosewater honey", flavors:"Sweet, Honey, Floral", wines:"Muscat of Samos, Greece, Sauternes, Bordeaux, Orange Muscat, California"},
    {cuisine:"Middle Eastern", name:"Hummus & Warm Pita", desc:"Silky chickpea dip with olive oil, za'atar, warm fresh bread", flavors:"Savoury, Nutty, Earthy", wines:"Sauvignon Blanc, Sancerre, Grüner Veltliner, Kamptal, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Lamb Kofta", desc:"Spiced minced lamb skewers with cumin, coriander, chili", flavors:"Spiced, Smoky, Rich", wines:"Syrah, Crozes-Hermitage, Malbec, Mendoza, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Chicken Shawarma", desc:"Slow-roasted spiced chicken with pickled vegetables and garlic sauce", flavors:"Spiced, Tangy, Savoury", wines:"Grenache Rosé, Provence, Gewurztraminer (dry), Alsace, Santa Barbara County Grenache Rosé"},
    {cuisine:"Middle Eastern", name:"Fattoush", desc:"Levantine bread salad with sumac, radish, cucumber, mint, fried pita", flavors:"Bright, Herbal, Tangy", wines:"Sauvignon Blanc, Marlborough, Vinho Verde, Portugal, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Mansaf", desc:"Jordan's national dish — lamb in fermented yogurt sauce over rice", flavors:"Tangy, Rich, Savoury", wines:"Gewurztraminer (off-dry), Alsace, Riesling Spätlese, Mosel, Qupé Viognier, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Falafel in Pita", desc:"Crispy fried chickpea fritters, tahini sauce, pickled veg", flavors:"Crispy, Herbal, Nutty", wines:"Sauvignon Blanc, Loire, Cava Brut, Penedès, Santa Ynez Valley Grenache Blanc, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Moroccan Lamb Tagine", desc:"Slow-braised lamb with preserved lemon, olives, ras el hanout and apricot", flavors:"Aromatic, Sweet-Savoury, Rich", wines:"Grenache, Châteauneuf-du-Pape, Malbec, Mendoza, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Middle Eastern", name:"Kibbeh", desc:"Bulgur wheat and minced lamb — baked, fried or raw with olive oil", flavors:"Earthy, Spiced, Rich", wines:"Syrah, Northern Rhône, Grenache, Châteauneuf-du-Pape, Santa Barbara County Syrah"},
    {cuisine:"Middle Eastern", name:"Mixed Meze", desc:"A spread of dips, salads, cheese, olives, flatbread", flavors:"Varied, Saline, Herbal", wines:"Assyrtiko, Santorini, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Middle Eastern", name:"Baklava", desc:"Filo pastry layered with pistachios and walnuts, soaked in rosewater honey", flavors:"Sweet, Floral, Honey", wines:"Muscat de Rivesaltes, Roussillon, Sauternes, Bordeaux, Orange Muscat, California"},
    {cuisine:"Indian/Pakistani", name:"Butter Chicken", desc:"Tandoori chicken in tomato, cream, butter and fenugreek sauce", flavors:"Creamy, Mild, Spiced", wines:"Gewurztraminer (off-dry), Alsace, Riesling Spätlese, Pfalz, Qupé Viognier, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Biryani (Lamb)", desc:"Aromatic slow-cooked lamb with basmati rice, saffron, whole spices", flavors:"Aromatic, Rich, Spiced", wines:"Gewurztraminer, Alsace, Grenache, Southern Rhône, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Saag Paneer", desc:"Fresh Indian cheese in spiced creamed spinach", flavors:"Earthy, Mild, Creamy", wines:"Sauvignon Blanc, Marlborough, Grüner Veltliner, Kamptal, Qupé Viognier, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Tandoori Chicken", desc:"Marinated in yogurt and spices, cooked in a clay oven", flavors:"Smoky, Spiced, Charred", wines:"Riesling (off-dry), Mosel, Grenache Rosé, Provence, Qupé Viognier, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Dal Tadka", desc:"Yellow lentils tempered with mustard seeds, cumin, dried chili, garlic", flavors:"Earthy, Aromatic, Warm", wines:"Riesling Spätlese, Pfalz, Pinot Gris (off-dry), Alsace, Santa Barbara County Chenin Blanc"},
    {cuisine:"Indian/Pakistani", name:"Lamb Korma", desc:"Slow-cooked lamb in mild creamy sauce with almonds, cardamom, saffron", flavors:"Mild, Creamy, Aromatic", wines:"Viognier, Condrieu, Gewurztraminer, Alsace, Qupé Viognier, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Nihari", desc:"Slow-cooked beef shank with ginger, cardamom, saffron — Pakistani Sunday classic", flavors:"Rich, Spiced, Deep", wines:"Syrah, Barossa Valley, Malbec, Mendoza (high altitude), Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Seekh Kebab", desc:"Minced lamb or beef on skewers, chargrilled with herbs and spice", flavors:"Smoky, Spiced, Charred", wines:"Syrah, Crozes-Hermitage, Malbec, Mendoza, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Indian/Pakistani", name:"Haleem", desc:"Slow-cooked wheat, lentils and meat — hours of cooking reduce it to one", flavors:"Deep, Earthy, Rich", wines:"Riesling Spätlese, Mosel, Syrah, Crozes-Hermitage, Pinot Gris, Alsace"},
    {cuisine:"Indian/Pakistani", name:"Kheer", desc:"Slow-cooked rice pudding with cardamom, saffron, pistachios, rose water", flavors:"Sweet, Floral, Aromatic", wines:"Muscat d'Alsace (late harvest), Moscato d'Asti, Piemonte, Orange Muscat, California"},
    {cuisine:"Thai", name:"Pad Thai", desc:"Stir-fried rice noodles with egg, tofu or shrimp, tamarind, peanuts", flavors:"Tangy, Nutty, Umami", wines:"Riesling (off-dry), Mosel, Gewurztraminer, Alsace, Pinot Gris (dry), Santa Barbara"},
    {cuisine:"Thai", name:"Green Curry", desc:"Coconut milk, green chili paste, Thai basil, galangal, kaffir lime", flavors:"Spicy, Herbal, Coconut", wines:"Riesling (off-dry), Mosel, Pinot Gris (off-dry), Alsace, Qupé Viognier, Santa Barbara"},
    {cuisine:"Thai", name:"Tom Yum Soup", desc:"Hot and sour broth with lemongrass, galangal, chili, lime, mushrooms", flavors:"Spicy, Sour, Aromatic", wines:"Riesling Kabinett, Mosel, Grüner Veltliner, Wachau, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Thai", name:"Massaman Curry", desc:"Mild coconut curry with potato, peanuts and warming whole spices", flavors:"Mild, Nutty, Sweet", wines:"Viognier, Condrieu, Riesling (off-dry), Pfalz, Qupé Viognier, Santa Barbara"},
    {cuisine:"Thai", name:"Som Tam", desc:"Green papaya salad with lime, chili, garlic, palm sugar, dried shrimp", flavors:"Sour, Spicy, Bright", wines:"Sauvignon Blanc, Marlborough, Grüner Veltliner, Kamptal, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Thai", name:"Larb", desc:"Minced meat salad with toasted rice, lime, fish sauce, fresh herbs, chili", flavors:"Sour, Herbal, Umami", wines:"Grüner Veltliner, Wachau, Riesling (dry), Alsace, Santa Barbara County Sauvignon Blanc"},
    {cuisine:"Thai", name:"Pad Krapow", desc:"Thai basil pork or beef stir-fry with garlic, chili, oyster sauce, egg", flavors:"Spicy, Umami, Herbal", wines:"Riesling (off-dry), Mosel, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Thai", name:"Mango Sticky Rice", desc:"Sweet glutinous rice with fresh mango, coconut cream, toasted sesame", flavors:"Sweet, Tropical, Creamy", wines:"Moscato d'Asti, Piemonte, Riesling Auslese, Rheingau, Orange Muscat, California"},
    {cuisine:"Thai", name:"Tod Mun Pla", desc:"Thai fish cakes with red curry paste, kaffir lime, long beans", flavors:"Spiced, Herbal, Saline", wines:"Albariño, Rías Baixas, Grüner Veltliner, Kamptal, Santa Barbara County Sauvignon Blanc"},
    {cuisine:"Thai", name:"Red Curry with Duck", desc:"Rich red curry paste, coconut milk, duck, bamboo shoots, Thai basil", flavors:"Rich, Spicy, Aromatic", wines:"Gewurztraminer (off-dry), Alsace, Riesling (off-dry), Mosel, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Pho Bo", desc:"Slow-cooked beef bone broth, rice noodles, herbs and condiments", flavors:"Aromatic, Umami, Delicate", wines:"Pinot Noir, Burgundy (village), Riesling (off-dry), Mosel, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Bánh Mì", desc:"Vietnamese baguette with pâté, pickled daikon, jalapeño, herbs", flavors:"Tangy, Herbal, Savoury", wines:"Riesling (dry), Alsace, Champagne Brut, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Gỏi Cuốn", desc:"Fresh spring rolls — shrimp, pork, herbs, rice vermicelli, peanut dip", flavors:"Fresh, Herbal, Delicate", wines:"Sauvignon Blanc, Sancerre, Grüner Veltliner, Wachau, Santa Barbara County Albariño"},
    {cuisine:"Vietnamese", name:"Bò Lúc Lắc", desc:"Wok-tossed cubed beef with black pepper, oyster sauce, lime and salad", flavors:"Umami, Peppery, Rich", wines:"Merlot, Saint-Émilion, Syrah, Crozes-Hermitage, Santa Barbara County Pinot Noir"},
    {cuisine:"Vietnamese", name:"Bánh Xèo", desc:"Crispy turmeric rice pancake with shrimp, pork belly, mung beans", flavors:"Crispy, Turmeric, Savoury", wines:"Riesling Kabinett, Mosel, Champagne Rosé, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Cơm Tấm", desc:"Broken rice with grilled pork chop, shredded pork skin, egg, pickled veg", flavors:"Savoury, Charred, Tangy", wines:"Pinot Noir, Willamette Valley, Grenache Rosé, Provence, Santa Barbara County Pinot Noir"},
    {cuisine:"Vietnamese", name:"Chả Cá", desc:"Turmeric and dill-marinated fish with noodles, peanuts, shrimp paste", flavors:"Aromatic, Herbal, Saline", wines:"Grüner Veltliner, Wachau, Sauvignon Blanc, Marlborough, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Bún Chả", desc:"Grilled pork patties in dipping broth, rice vermicelli, fresh herbs", flavors:"Savoury, Herbal, Sweet-Sour", wines:"Riesling (off-dry), Pfalz, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Vietnamese", name:"Cao Lầu", desc:"Hội An noodles — thick noodles, pork, greens, rice crackers, herbs", flavors:"Savoury, Herbal, Textured", wines:"Pinot Noir, Willamette Valley, Riesling (dry), Rheingau, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Vietnamese", name:"Bún Bò Huế", desc:"Spicy lemongrass beef noodle soup — richer and more fiery than Pho", flavors:"Spicy, Aromatic, Rich", wines:"Riesling (off-dry), Mosel, Gewurztraminer (off-dry), Alsace, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Chinese", name:"Peking Duck", desc:"Lacquered roasted duck with pancakes, hoisin, cucumber, spring onion", flavors:"Rich, Sweet, Crispy", wines:"Pinot Noir, Burgundy, Champagne Brut, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Chinese", name:"Dim Sum", desc:"Steamed and fried dumplings — har gow, siu mai, char siu bao", flavors:"Delicate, Steamed, Umami", wines:"Champagne Brut, Albariño, Rías Baixas, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Chinese", name:"Kung Pao Chicken", desc:"Sichuan stir-fry with chicken, dried chili, peanuts, Sichuan pepper", flavors:"Spicy, Nutty, Numbing", wines:"Gewurztraminer (off-dry), Alsace, Riesling Spätlese, Mosel, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Chinese", name:"Mapo Tofu", desc:"Silken tofu in Sichuan doubanjiang sauce with minced pork and numbing pepper", flavors:"Spicy, Numbing, Rich", wines:"Gewurztraminer, Alsace, Riesling (off-dry), Rheingau, Grüner Veltliner, Wachau"},
    {cuisine:"Chinese", name:"Char Siu", desc:"Cantonese BBQ pork — red-glazed, sweet, smoky", flavors:"Sweet, Smoky, Savoury", wines:"Pinot Noir, Burgundy, Zinfandel, Sonoma, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Chinese", name:"Cantonese Steamed Fish", desc:"Whole fish steamed with ginger, spring onion, soy, hot oil", flavors:"Delicate, Saline, Clean", wines:"Chablis Premier Cru, Grüner Veltliner, Wachau, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Chinese", name:"Xiaolongbao", desc:"Shanghai soup dumplings — thin skin, pork and rich broth inside", flavors:"Delicate, Umami, Saline", wines:"Champagne Blanc de Blancs, Cava Brut, Penedès, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Chinese", name:"Sweet & Sour Pork", desc:"Cantonese classic — crispy pork, pineapple, pepper in glossy sauce", flavors:"Sweet, Sour, Crispy", wines:"Riesling Spätlese, Mosel, Prosecco, Valdobbiadene, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Chinese", name:"Yangzhou Fried Rice", desc:"Egg, prawns, pork, peas and spring onion in wok-fried rice", flavors:"Savoury, Umami, Versatile", wines:"Pinot Gris, Alsace, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Chinese", name:"Sichuan Hot Pot", desc:"Communal spicy broth with meat, offal, veg, tofu cooked at the table", flavors:"Spicy, Communal, Varied", wines:"Gewurztraminer (off-dry), Alsace, Riesling Spätlese, Pfalz, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Japanese", name:"Omakase Sushi", desc:"Chef's selection of nigiri — premium tuna, yellowtail, sea urchin", flavors:"Delicate, Umami, Clean", wines:"Champagne Grand Cru, Chablis Premier Cru, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Japanese", name:"Wagyu Teppanyaki", desc:"A5 Wagyu beef on an iron plate — extraordinarily marbled", flavors:"Rich, Fatty, Umami", wines:"Pinot Noir, Vosne-Romanée, Nebbiolo, Barbaresco, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Japanese", name:"Tonkotsu Ramen", desc:"Rich, creamy pork bone broth, chashu pork, soft egg, noodles", flavors:"Rich, Umami, Creamy", wines:"Riesling (off-dry), Mosel, Pinot Gris (smoky), Alsace, Santa Barbara County Pinot Gris"},
    {cuisine:"Japanese", name:"Tempura", desc:"Prawn and seasonal vegetable tempura in light, airy batter", flavors:"Crispy, Delicate, Clean", wines:"Champagne Blanc de Blancs, Soave Classico, Veneto, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Japanese", name:"Yakitori", desc:"Grilled chicken skewers — thigh, liver, heart — glazed with tare sauce", flavors:"Smoky, Savoury, Sweet-Salty", wines:"Pinot Noir, Willamette Valley, Riesling (dry), Alsace, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Japanese", name:"Miso Black Cod", desc:"White miso, mirin, sake-marinated butter fish", flavors:"Rich, Sweet, Umami", wines:"White Burgundy, Meursault, Viognier, Condrieu, Santa Rita Hills Chardonnay, Santa Barbara"},
    {cuisine:"Japanese", name:"Gyoza", desc:"Pan-fried pork and cabbage dumplings — crispy base, steamed top", flavors:"Savoury, Crispy, Umami", wines:"Champagne Brut, Riesling (dry), Alsace, Santa Barbara County Albariño"},
    {cuisine:"Japanese", name:"Shabu-Shabu", desc:"Paper-thin beef swirled in kombu dashi broth with ponzu and sesame", flavors:"Delicate, Clean, Umami", wines:"Pinot Noir, Gevrey-Chambertin, Champagne Brut, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Japanese", name:"Katsu Curry", desc:"Breaded pork or chicken cutlet with Japanese curry sauce and rice", flavors:"Mild, Crispy, Comforting", wines:"Riesling (off-dry), Pfalz, Gewurztraminer (dry), Alsace, Pinot Gris, Santa Barbara County"},
    {cuisine:"Japanese", name:"Matcha Desserts", desc:"Matcha mochi, cake or ice cream — bitter-sweet green tea", flavors:"Bitter, Sweet, Earthy", wines:"Moscato d'Asti, Piemonte, Riesling Auslese, Rheingau, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Korean", name:"Korean BBQ", desc:"Galbi short ribs and samgyeopsal pork belly grilled at the table", flavors:"Smoky, Rich, Savoury", wines:"Pinot Noir, Burgundy, Riesling (off-dry), Mosel, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Korean", name:"Bibimbap", desc:"Mixed rice bowl with vegetables, beef, a fried egg and gochujang", flavors:"Spiced, Varied, Umami", wines:"Grenache Rosé, Provence, Riesling (off-dry), Pfalz, Santa Barbara County Grenache Rosé"},
    {cuisine:"Korean", name:"Kimchi Jjigae", desc:"Fermented kimchi stew with pork, tofu and gochugaru", flavors:"Fermented, Spicy, Funky", wines:"Gewurztraminer (off-dry), Alsace, Riesling (dry), Alsace, Pinot Gris (off-dry), Santa Barbara"},
    {cuisine:"Korean", name:"Bulgogi", desc:"Thinly sliced beef in soy, sesame, pear, garlic, ginger marinade", flavors:"Sweet, Umami, Savoury", wines:"Pinot Noir, Burgundy, Merlot, Saint-Émilion, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Korean", name:"Japchae", desc:"Glass noodles stir-fried with vegetables and beef in sesame-soy sauce", flavors:"Savoury, Sesame, Light", wines:"Pinot Gris (dry), Alsace, Pinot Noir, Willamette Valley, Santa Barbara County Pinot Noir"},
    {cuisine:"Korean", name:"Sundubu Jjigae", desc:"Silken tofu stew with clams or shrimp, gochugaru, egg", flavors:"Spicy, Saline, Silky", wines:"Riesling (off-dry), Mosel, Albariño, Rías Baixas, Santa Barbara County Albariño"},
    {cuisine:"Korean", name:"Dakgalbi", desc:"Spicy stir-fried chicken with gochujang, sweet potato, rice cake, cabbage", flavors:"Spicy, Sweet, Hearty", wines:"Riesling (off-dry), Pfalz, Gewurztraminer (off-dry), Alsace, Santa Barbara County Grenache Rosé"},
    {cuisine:"Korean", name:"Samgyetang", desc:"Whole young chicken stuffed with ginseng, rice, jujube — slow-simmered", flavors:"Delicate, Herbal, Warming", wines:"Riesling (dry), Rheingau, Chablis, Burgundy, Santa Maria Valley Chardonnay, Santa Barbara"},
    {cuisine:"Korean", name:"Jeon", desc:"Korean savoury pancakes — kimchi jeon, haemul pajeon (seafood)", flavors:"Crispy, Savoury, Herbal", wines:"Champagne Brut, Albariño, Rías Baixas, Santa Barbara County Albariño"},
    {cuisine:"Korean", name:"Hotteok", desc:"Sweet pan-fried pancakes filled with brown sugar, cinnamon, peanuts", flavors:"Sweet, Warm, Spiced", wines:"Muscat de Beaumes-de-Venise, Rhône, Riesling Auslese, Rheingau, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Mexican", name:"Mole Poblano", desc:"Complex turkey or chicken in a 20+ ingredient sauce with chocolate and chili", flavors:"Complex, Rich, Chocolate", wines:"Grenache, Châteauneuf-du-Pape, Zinfandel, Sonoma, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Mexican", name:"Tacos al Pastor", desc:"Spit-roasted pork with pineapple, coriander and white onion", flavors:"Sweet, Smoky, Tangy", wines:"Riesling (off-dry), Mosel, Grenache Rosé, Provence, Santa Barbara County Grenache Rosé"},
    {cuisine:"Mexican", name:"Ceviche", desc:"Lime-cured raw fish with chili, red onion, coriander", flavors:"Bright, Sour, Herbal", wines:"Albariño, Rías Baixas, Sauvignon Blanc, Marlborough, Santa Barbara County Albariño"},
    {cuisine:"Mexican", name:"Birria", desc:"Slow-braised goat or beef in complex dried chili broth — served with consommé", flavors:"Rich, Spiced, Deep", wines:"Malbec, Mendoza, Grenache, Southern Rhône, Zinfandel, Sonoma"},
    {cuisine:"Mexican", name:"Enchiladas Verdes", desc:"Chicken in tomatillo and serrano chili sauce, topped with crema", flavors:"Bright, Tangy, Spiced", wines:"Sauvignon Blanc, Sancerre, Grüner Veltliner, Kamptal, Santa Ynez Valley Sauvignon Blanc, Santa Barbara"},
    {cuisine:"Mexican", name:"Carnitas", desc:"Slow-cooked, crisped pork — orange and lard-braised, served in tacos", flavors:"Rich, Crispy, Citrus", wines:"Pinot Noir, Burgundy, Grenache, Southern Rhône, Santa Rita Hills Pinot Noir, Santa Barbara"},
    {cuisine:"Mexican", name:"Pozole Rojo", desc:"Hominy corn soup with dried chili broth, slow-cooked pork or chicken", flavors:"Spiced, Earthy, Rich", wines:"Grenache Rosé, Provence, Grenache, Southern Rhône, Santa Barbara County Grenache"},
    {cuisine:"Mexican", name:"Tamales", desc:"Corn masa stuffed with pork, chicken or cheese, steamed in corn husk", flavors:"Earthy, Savoury, Comforting", wines:"Riesling (off-dry), Mosel, Grenache, Southern Rhône, Santa Barbara County Grenache"},
    {cuisine:"Mexican", name:"Chiles en Nogada", desc:"Stuffed poblano peppers in walnut cream sauce, pomegranate, parsley", flavors:"Rich, Fruity, Complex", wines:"Riesling (off-dry), Alsace, Viognier, Condrieu, Qupé Viognier, Santa Barbara"},
    {cuisine:"Mexican", name:"Churros con Chocolate", desc:"Fried dough rings with thick dark drinking chocolate", flavors:"Sweet, Fried, Chocolate", wines:"Pedro Ximénez Sherry, Jerez, Brachetto d'Acqui, Piemonte, Orange Muscat, California"},
    {cuisine:"Around the World", name:"Jerk Chicken", desc:"Jamaican scotch bonnet and allspice chicken, charcoal smoked", flavors:"Spicy, Smoky, Aromatic", wines:"Riesling (off-dry), Mosel, Gewurztraminer (off-dry), Alsace, Qupé Viognier, Santa Barbara"},
    {cuisine:"Around the World", name:"Peri Peri Chicken", desc:"Mozambican-Portuguese bird's eye chili-marinated chicken, grilled", flavors:"Spicy, Smoky, Herbal", wines:"Vinho Verde, Portugal, Alentejo Rosé, Portugal, Santa Barbara County Grenache Rosé"},
    {cuisine:"Around the World", name:"Doro Wat", desc:"Ethiopian slow-cooked chicken in berbere-spiced onion sauce on injera", flavors:"Spiced, Earthy, Complex", wines:"Syrah, Crozes-Hermitage, Riesling (off-dry), Pfalz, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Around the World", name:"Moroccan Lamb Tagine", desc:"Slow-braised lamb with preserved lemon, olives, ras el hanout, apricot", flavors:"Aromatic, Sweet-Savoury, Rich", wines:"Grenache, Châteauneuf-du-Pape, Malbec, Mendoza, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Around the World", name:"Argentine Asado", desc:"Wood-fired whole animal or mixed grill with chimichurri", flavors:"Smoky, Rich, Charred", wines:"Malbec, Mendoza, Cabernet Sauvignon, Maipo, Chile, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Around the World", name:"Brazilian Feijoada", desc:"Black bean stew with pork, chorizo, sausage — served with rice and farofa", flavors:"Rich, Smoky, Earthy", wines:"Malbec, Mendoza, Carmenère, Colchagua, Chile, Zinfandel, Sonoma"},
    {cuisine:"Around the World", name:"Peruvian Ceviche", desc:"Leche de tigre — lime-cured raw fish with chili, red onion, coriander", flavors:"Bright, Sour, Herbal", wines:"Albariño, Rías Baixas, Sauvignon Blanc, Marlborough, Santa Barbara County Albariño"},
    {cuisine:"Around the World", name:"South African Braai", desc:"Wood-fire boerewors sausage, lamb chops, peri peri chicken — communal", flavors:"Smoky, Spiced, Communal", wines:"Pinotage, Stellenbosch, Shiraz, Swartland, Ballard Canyon Syrah, Santa Barbara"},
    {cuisine:"Around the World", name:"Georgian Khinkali", desc:"Dumplings with spiced lamb or beef — folded in pleats, eaten by hand", flavors:"Savoury, Juicy, Spiced", wines:"Rkatsiteli, Georgia (amber), Saperavi, Kakheti, Georgia, Champagne Brut"},
    {cuisine:"Around the World", name:"West African Groundnut Soup", desc:"Peanut-based stew with chicken, tomato and aromatic spices over rice", flavors:"Rich, Nutty, Earthy", wines:"Viognier, Condrieu, Gewurztraminer (off-dry), Alsace, Qupé Viognier, Santa Barbara"},
    {cuisine:"Desserts of the World", name:"Crème Brûlée", desc:"French vanilla custard with a caramelised sugar crust", flavors:"Sweet, Creamy, Vanilla", wines:"Sauternes, Bordeaux, Tokaji Aszú 5 Puttonyos, Hungary, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Pavlova", desc:"Australian meringue base, whipped cream, fresh berries and passion fruit", flavors:"Sweet, Fruity, Light", wines:"Moscato d'Asti, Piemonte, Champagne Rosé Demi-Sec, Brachetto d'Acqui, Piemonte"},
    {cuisine:"Desserts of the World", name:"Gulab Jamun", desc:"Indian milk solid balls deep-fried and soaked in rose and cardamom syrup", flavors:"Sweet, Floral, Indulgent", wines:"Muscat d'Alsace (late harvest), Tokaji Aszú 5 Puttonyos, Hungary, Orange Muscat, California"},
    {cuisine:"Desserts of the World", name:"Tres Leches Cake", desc:"Latin American sponge soaked in evaporated, condensed milk and cream", flavors:"Sweet, Creamy, Vanilla", wines:"Sauternes, Bordeaux, Muscat de Frontignan, Languedoc, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Pastel de Nata", desc:"Portuguese egg custard tart with flaky pastry and caramelised top", flavors:"Sweet, Caramel, Flaky", wines:"Madeira (Rainwater), Portugal, Moscato d'Asti, Piemonte, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Panna Cotta", desc:"Italian silky vanilla cream with berry coulis or caramel sauce", flavors:"Sweet, Creamy, Delicate", wines:"Moscato d'Asti, Piemonte, Brachetto d'Acqui, Piemonte, Prosecco Extra Dry, Valdobbiadene"},
    {cuisine:"Desserts of the World", name:"New York Cheesecake", desc:"Dense cream cheese cake with graham cracker crust, plain or berry topped", flavors:"Sweet, Rich, Tangy", wines:"Sauternes, Bordeaux, Riesling Beerenauslese, Mosel, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Brigadeiro", desc:"Brazilian chocolate condensed milk truffle rolled in chocolate sprinkles", flavors:"Sweet, Chocolate, Rich", wines:"Pedro Ximénez Sherry, Jerez, Brachetto d'Acqui, Piemonte, Tawny Port 10 year, Douro"},
    {cuisine:"Desserts of the World", name:"Mooncake", desc:"Chinese festival pastry filled with lotus paste and salted egg yolk", flavors:"Sweet, Earthy, Rich", wines:"Sauternes, Bordeaux, Tokaji Aszú 3 Puttonyos, Hungary, Orange Muscat, California"},
    {cuisine:"Desserts of the World", name:"Kanafeh", desc:"Levantine shredded pastry filled with soft cheese, soaked in sugar syrup", flavors:"Sweet, Savoury-Sweet, Cheese", wines:"Muscat of Samos, Greece, Sauternes, Bordeaux, Orange Muscat, California"},
    {cuisine:"Desserts of the World", name:"Bingsu", desc:"Korean shaved ice with sweet red bean, mochi, condensed milk", flavors:"Sweet, Light, Refreshing", wines:"Moscato d'Asti, Piemonte, Champagne Rosé Demi-Sec, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Kouign-Amann", desc:"Breton caramelised butter cake — deeply caramelised, flaky, indulgent", flavors:"Sweet, Caramel, Buttery", wines:"Sauternes, Bordeaux, Champagne Demi-Sec, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Rum Cake", desc:"Caribbean dark rum-soaked spiced sponge with toffee glaze and nuts", flavors:"Sweet, Boozy, Spiced", wines:"Malmsey Madeira, Madeira Island, Tawny Port 20 year, Douro, Zinfandel Late Harvest, Sonoma"},
    {cuisine:"Desserts of the World", name:"Apple Strudel", desc:"Viennese flaky pastry filled with cinnamon apple, raisins and pine nuts", flavors:"Sweet, Spiced, Fruity", wines:"Riesling Auslese, Rheingau, Gewurztraminer Vendange Tardive, Alsace, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Profiteroles", desc:"French choux balls filled with cream, drizzled with hot chocolate sauce", flavors:"Sweet, Chocolate, Cream", wines:"Sauternes, Bordeaux, Brachetto d'Acqui, Piemonte, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Banoffee Pie", desc:"British banana and toffee cream pie with digestive biscuit base", flavors:"Sweet, Caramel, Banana", wines:"Sauternes, Bordeaux, Tawny Port 10 year, Douro, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Mochi Ice Cream", desc:"Japanese rice cake wrapped around ice cream — matcha, red bean or vanilla", flavors:"Sweet, Chewy, Varied", wines:"Moscato d'Asti, Piemonte, Champagne Blanc de Blancs, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Crème Caramel", desc:"Silky baked custard with liquid caramel sauce — universal dessert", flavors:"Sweet, Caramel, Silky", wines:"Sauternes, Bordeaux, Malmsey Madeira, Madeira Island, Late Harvest Riesling, Santa Barbara County"},
    {cuisine:"Desserts of the World", name:"Basbousa", desc:"Egyptian semolina cake soaked in rose water and orange blossom syrup", flavors:"Sweet, Floral, Dense", wines:"Muscat of Samos, Greece, Sauternes, Bordeaux, Orange Muscat, California"},
    {cuisine:"Desserts of the World", name:"Kulfi", desc:"Indian cardamom and pistachio ice cream — dense, slow-frozen, on a stick", flavors:"Sweet, Spiced, Nutty", wines:"Muscat d'Alsace (late harvest), Gewurztraminer Vendange Tardive, Alsace, Orange Muscat, California"}
  ];
  const TOOLS_INDEX = [
    {name:"Grape Profiles", page:"/grapes", sub:"Interactive Tool · 20 grape varieties", snip:"Explore 20 major wine grapes — origin, aromas, palate, structure, regions and pairings.", terms:"grape profiles varieties wine education tool red white"},
    {name:"Famous Wine Regions", page:"/region-profiles", sub:"Interactive Tool · 26 wine regions", snip:"Explore the world's great wine regions — soil, climate, geography and the grapes they define.", terms:"famous wine regions appellations terroir tool education"},
    {name:"Pairings by Cuisine", page:"/cuisine-pairings", sub:"Interactive Tool · 16 cuisines, 167 dishes", snip:"Find the right wine for any dish across 16 world cuisines.", terms:"pairings cuisine food wine match interactive tool"},
    {name:"Wine & Food Pairing", page:"/pairing", sub:"Interactive Tool · Pairing Principles", snip:"Pair wine to food by grape, protein, preparation and cheese.", terms:"wine food pairing principles grape protein cheese preparation match recommend"},
    {name:"Aroma Explorer", page:"/aromas", sub:"Interactive Tool · 33 grape aroma profiles", snip:"What does this grape actually smell like? Explore aromas by category.", terms:"aroma aromas nose smell tasting fruit floral earth spice oak primary secondary tertiary"},
    {name:"Palate & Structure", page:"/palate", sub:"Interactive Tool · Wine structure", snip:"Understand the four pillars of wine structure — body, tannin, acidity, alcohol.", terms:"palate structure body tannin acidity alcohol balance mouthfeel tasting"}
  ];
  const AROMAS_INDEX = [
    {id:"cab-sauv", name:"Cabernet Sauvignon", wtype:"red", origin:"Bordeaux, France", tagline:"Bold and structured — a nose that announces itself.", aromas:"Blackcurrant, Blackberry, Black Cherry, Dark Plum, Cassis, Dried Violet, Rose (faint), Green Bell Pepper, Eucalyptus, Mint, Bay Leaf, Cedar, Tobacco Leaf, Graphite, Pencil Shaving, Black Pepper, Clove, Vanilla, Toast, Smoke, Coconut (American oak), Cigar Box, Leather, Coffee, Dark Chocolate, Truffle (aged)"},
    {id:"merlot", name:"Merlot", wtype:"red", origin:"Bordeaux, France", tagline:"Softer and more approachable — plum-forward with earthy depth.", aromas:"Plum, Black Cherry, Blueberry, Fig, Dark Raspberry, Violet, Rose Petal, Bay Leaf, Thyme, Sage, Moist Earth, Mocha, Cedar, Clove, Allspice, Nutmeg, Vanilla, Mocha, Toasted Oak, Leather, Tobacco, Dried Herbs, Chocolate"},
    {id:"pinot-noir", name:"Pinot Noir", wtype:"red", origin:"Burgundy, France", tagline:"Ethereal and fragrant — the most perfumed of all red grapes.", aromas:"Red Cherry, Raspberry, Strawberry, Cranberry, Red Currant, Dried Cherry, Rose Petal, Violet, Geranium, Dried Herbs, Green Tea, Forest Floor, Wet Earth, Mushroom, Autumn Leaves, Compost, Cinnamon, Star Anise, Clove (faint), Vanilla, Toast, Smoke (light), Barnyard, Leather, Truffles, Game, Cola, Dried Rose"},
    {id:"syrah", name:"Syrah / Shiraz", wtype:"red", origin:"Northern Rhône / Australia", tagline:"Spicy, smoky, and wild — one of the most distinctive noses in wine.", aromas:"Blackberry, Black Plum, Blueberry, Dark Cherry, Boysenberry, Violet, Purple Flower, Olive, Dark Olive, Rosemary, Iron, Blood, Wet Stone, Black Pepper, White Pepper, Licorice, Clove, Anise, Smoke, Vanilla, Toasted Wood, Bacon Fat, Smoked Meat, Leather, Game, Coffee, Dark Chocolate"},
    {id:"grenache", name:"Grenache / Garnacha", wtype:"red", origin:"Southern Rhône / Spain", tagline:"Juicy and spiced — warm-climate charm with herbal soul.", aromas:"Red Cherry, Raspberry, Strawberry, Orange Peel, Red Plum, Dried Cranberry, Lavender, Dried Rose, Hibiscus, Garrigue, Wild Thyme, Rosemary, Dried Lavender, Fennel, Dusty Earth, Iron, Leather, White Pepper, Cinnamon, Licorice, Clove, Vanilla, Toast (light), Dried Herbs, Tobacco, Leather, Prune, Fig (aged)"},
    {id:"sangiovese", name:"Sangiovese", wtype:"red", origin:"Tuscany, Italy", tagline:"Savory and tart — tomato, cherry, and the Italian countryside.", aromas:"Sour Cherry, Red Cherry, Red Plum, Dried Cherry, Tomato, Dried Rose, Violet (faint), Dried Herbs, Oregano, Tomato Leaf, Sage, Bay Leaf, Thyme, Leather, Dusty Earth, Clay, Iron, Clove, Black Pepper, Cinnamon, Vanilla, Toast, Cedar, Tobacco, Leather, Dried Herbs, Balsamic (aged), Mushroom"},
    {id:"nebbiolo", name:"Nebbiolo", wtype:"red", origin:"Piedmont, Italy", tagline:"Tar and roses — one of wine's most famous and distinctive aromas.", aromas:"Sour Cherry, Dried Cherry, Red Plum, Pomegranate, Raspberry (faint), Rose, Dried Rose, Violet, Rose Petal — intense and unmistakable, Dried Herbs, Licorice Root, Tar, Iron, Clay, Dried Earth, Anise, Cinnamon, Clove, Star Anise, Toast, Vanilla, Sandalwood, Tobacco, Leather, Truffle, Dried Mushroom, Camphor, Game"},
    {id:"tempranillo", name:"Tempranillo", wtype:"red", origin:"Rioja, Spain", tagline:"Leather and dried cherry — the soul of the Spanish table.", aromas:"Dried Cherry, Sour Cherry, Plum, Tomato, Red Currant, Dried Strawberry, Dried Rose, Violet (light), Tomato Leaf, Dried Herbs, Thyme, Leather, Dusty Earth, Tobacco, Cedar, Black Pepper, Clove, Cinnamon, Vanilla, Coconut (American oak), Dill (American oak), Toast, Tobacco, Leather, Dried Fruit, Coffee (aged), Cigar Box"},
    {id:"malbec", name:"Malbec", wtype:"red", origin:"Mendoza, Argentina / Cahors, France", tagline:"Violet, dark plum, and chocolate — the Argentine powerhouse.", aromas:"Dark Cherry, Black Plum, Blackberry, Blueberry, Black Currant, Dried Plum, Violet, Dark Flower, Iris, Dried Herbs (faint), Mocha, Dark Chocolate, Coffee, Cedar, Black Pepper, Clove, Cinnamon, Vanilla, Mocha, Toasted Oak, Smoke, Leather, Tobacco, Coffee, Cocoa, Game (Cahors style)"},
    {id:"zinfandel", name:"Zinfandel / Primitivo", wtype:"red", origin:"California / Puglia, Italy", tagline:"Jammy and bold — blackberry pie, pepper, and smoke.", aromas:"Blackberry Jam, Blueberry, Black Cherry, Raspberry Jam, Dried Cranberry, Raisin, Violet (faint), Dried Herbs, Sage, Leather, Dusty Earth, Mocha, Black Pepper, White Pepper, Cinnamon, Clove, Anise, Cardamom, Vanilla, Smoke, Toast, Coconut, Leather, Tobacco, Prune, Port-like (overripe), Dark Chocolate"},
    {id:"mourvedre", name:"Mourvèdre / Monastrell", wtype:"red", origin:"Bandol / Jumilla, Spain", tagline:"Wild and gamey — dark fruit with an animal, earthy intensity.", aromas:"Blackberry, Black Plum, Dark Cherry, Black Olive, Dried Blueberry, Lavender, Dried Violet, Garrigue, Thyme, Wild Herbs, Olive, Lavender, Iron, Leather, Wet Earth, Animal, Game, Black Pepper, Clove, Licorice, Smoke, Toast, Vanilla, Leather, Smoked Meat, Barnyard, Game, Dried Meat, Tobacco"},
    {id:"barbera", name:"Barbera d'Asti / d'Alba", wtype:"red", origin:"Piedmont, Italy", tagline:"Bright and juicy — cherry, herbs, and easy Italian charm.", aromas:"Red Cherry, Sour Cherry, Blackberry, Plum, Red Currant, Violet, Dried Rose, Dried Herbs, Oregano, Thyme, Leather (light), Dusty Earth, Clove, Black Pepper (light), Anise, Vanilla, Toast (when oaked), Cedar, Dried Cherry, Leather, Tobacco (light)"},
    {id:"cab-franc", name:"Cabernet Franc", wtype:"red", origin:"Loire Valley / Bordeaux", tagline:"Herbal and elegant — pencil shaving, red fruit, and fresh garden.", aromas:"Red Currant, Red Cherry, Raspberry, Strawberry, Blueberry, Violet, Rose, Geranium, Green Bell Pepper, Graphite, Pencil Shaving, Tomato Leaf, Fresh Garden Herbs, Pencil Shaving, Wet Gravel, Graphite, Cedar, Black Pepper, Clove (light), Cedar, Vanilla (light), Toast, Leather, Tobacco, Dried Herbs, Earthy Minerality"},
    {id:"carmenere", name:"Carménère", wtype:"red", origin:"Chile", tagline:"Smoky and herbal — paprika, dark fruit, and a green edge.", aromas:"Dark Cherry, Black Plum, Blackberry, Black Currant, Violet (faint), Green Bell Pepper, Tomato Leaf, Fresh Herbs, Paprika, Leather, Smoked Earth, Mocha, Smoked Paprika, Black Pepper, Clove, Anise, Smoke, Vanilla, Cedar, Leather, Coffee, Dark Chocolate, Tobacco"},
    {id:"aglianico", name:"Aglianico", wtype:"red", origin:"Campania & Basilicata, Italy", tagline:"Ancient and powerful — tar, dark fruit, and volcanic earth.", aromas:"Black Cherry, Dark Plum, Blackberry, Black Currant, Dried Fig, Dried Violet, Rose (faint), Dried Herbs, Oregano, Bay Leaf, Tar, Iron, Volcanic Ash, Dark Chocolate, Leather, Black Pepper, Clove, Licorice, Anise, Smoke, Toast, Cedar, Tobacco, Leather, Game, Dried Fruit, Coffee, Earthy Minerality"},
    {id:"nero-davola", name:"Nero d'Avola", wtype:"red", origin:"Sicily, Italy", tagline:"Sun-drenched and bold — dark fruit, chocolate, and Mediterranean spice.", aromas:"Black Cherry, Dark Plum, Blackberry, Dried Fig, Raisin, Dried Violet, Rose (faint), Dried Herbs, Fennel Seed, Oregano, Dark Chocolate, Mocha, Leather, Volcanic Earth, Black Pepper, Licorice, Clove, Cinnamon, Smoke, Vanilla, Toast, Leather, Tobacco, Coffee, Dried Meat, Fig"},
    {id:"chardonnay", name:"Chardonnay", wtype:"white", origin:"Burgundy, France", tagline:"The great chameleon — from steely Chablis to rich buttery Napa.", aromas:"Green Apple, Pear, Lemon, Grapefruit, Peach, Nectarine, Pineapple (warm climate), Mango (oaked warm), Acacia, White Blossom, Honeysuckle, Fennel (faint), Flint, Chalk, Wet Stone (Chablis), Oyster Shell (Chablis), Ginger (faint), Vanilla, Butter, Toast, Cream, Hazelnut, Smoke, Coconut, Brioche, Honey, Beeswax, Toasted Almond, Petrol (aged)"},
    {id:"sauv-blanc", name:"Sauvignon Blanc", wtype:"white", origin:"Loire Valley / New Zealand", tagline:"Vivid and aromatic — grass, citrus, and that unmistakable green edge.", aromas:"Grapefruit, Lime, Lemon, Green Apple, Passionfruit, Gooseberry, Guava, White Peach, Elderflower, White Blossom, Freshly Cut Grass, Tomato Leaf, Asparagus, Jalapeño, Capsicum, Green Bell Pepper, Flint, Wet Stone, Chalk, Gunpowder (Sancerre), White Pepper (faint), Smoke (Fumé Blanc style), Vanilla (if oaked — rare), Cat's Pee (thiols — Marlborough), Dried Herbs"},
    {id:"riesling", name:"Riesling", wtype:"white", origin:"Mosel, Germany / Alsace", tagline:"Floral and precise — one of the most complex aromatic profiles in wine.", aromas:"Lime, Lemon, Green Apple, Apricot, Peach, Mandarin, White Peach, Pineapple (warm), Jasmine, White Rose, Orange Blossom, Honeysuckle, Fennel (faint), Dried Herbs (aged), Slate, Wet Stone, Mineral, Diesel, Petrol — the hallmark aged Riesling note, Ginger, Spice Cake, Rarely oaked — purity is the point, Petrol / Gasoline (TDN compound), Honey, Beeswax, Toasted Almond, Marmalade (aged)"},
    {id:"pinot-gris", name:"Pinot Gris / Pinot Grigio", wtype:"white", origin:"Alsace / Northern Italy", tagline:"Two personalities — crisp Italian lightness vs. rich Alsatian smoke.", aromas:"Pear, Green Apple, Lemon, White Peach, Apricot (Alsace), Melon, White Blossom, Acacia, Fennel (faint), Mineral, Flint, Honey (Alsace), Ginger, White Pepper, Nutmeg (Alsace), Rarely oaked (Italian style), Smoke (Alsatian style — distinctive), Smoked Bacon (Alsace), Honey, Beeswax, Almond, White Truffle (Alsace)"},
    {id:"gewurz", name:"Gewurztraminer", wtype:"white", origin:"Alsace, France", tagline:"The most immediately recognizable grape — lychee, rose, and exotic spice.", aromas:"Lychee, Mango, Grapefruit, Pink Grapefruit, Apricot, Guava, Rose, Rose Petal, Orange Blossom, Violet, Gardenia, Ginger Root, Lemongrass, Mineral (faint), Honey, Ginger, Cinnamon, Cardamom, Clove, Allspice, Turkish Delight, Rarely oaked, Petroleum / Diesel (aged), Honey, Marzipan, Beeswax, Gingerbread"},
    {id:"viognier", name:"Viognier", wtype:"white", origin:"Northern Rhône — Condrieu", tagline:"Heady and perfumed — apricot, honeysuckle, and almost oily richness.", aromas:"Apricot, Peach, Nectarine, Mango, Tangerine, White Peach, Honeysuckle, Violet, Orange Blossom, Jasmine, White Flower, Ginger, Lemongrass, Mineral (light), Ginger, Cinnamon, Nutmeg, Vanilla, Cream (if lees aged), Lanolin, Beeswax, Honey, Almond"},
    {id:"chenin", name:"Chenin Blanc", wtype:"white", origin:"Loire Valley / South Africa", tagline:"From bone dry to luscious sweet — quince, honey, and extraordinary range.", aromas:"Quince, Green Apple, Pear, Lemon, Honey, Apricot, Peach, Pineapple (warm climate), Acacia, White Blossom, Chamomile, Fennel, Fresh Hay, Straw, Flint, Wet Wool, Chalk, Mineral, Ginger, Honey Spice, Vanilla, Beeswax, Toast (if oaked), Beeswax, Lanolin, Honey, Toasted Almond, Dried Apricot, Quince Paste (aged)"},
    {id:"albarino", name:"Albariño / Alvarinho", wtype:"white", origin:"Rías Baixas / Vinho Verde", tagline:"Salty and citrusy — the ocean in a glass.", aromas:"Lemon, Lime, Grapefruit, White Peach, Apricot, Tangerine, White Blossom, Orange Blossom, Fresh Herbs, Lemon Verbena, Saline, Mineral, Wet Stone, Ocean Spray, White Pepper (light), Rarely oaked, Almond, Mineral Complexity (aged)"},
    {id:"gruner", name:"Grüner Veltliner", wtype:"white", origin:"Wachau & Kamptal, Austria", tagline:"White pepper and mineral — Austria's distinctive and underrated signature.", aromas:"Grapefruit, Lime, Green Apple, Pear, White Peach, Lemon Zest, White Blossom (faint), White Pepper — the defining aroma, Green Herbs, Celery Leaf, Radish, Mineral, Flint, Wet Stone, White Pepper — unmistakable, Ginger, Smoke, Vanilla (premium aged styles), Honey, Toasted Almond, Citrus Peel (aged), Mineral complexity"},
    {id:"assyrtiko", name:"Assyrtiko", wtype:"white", origin:"Santorini, Greece", tagline:"Volcanic and electric — saline, citrus, and ashy mineral intensity.", aromas:"Lemon, Lime, Green Apple, Grapefruit, White Peach, White Blossom (faint), Dried Herbs, Thyme (faint), Volcanic Ash, Pumice, Flint, Saline, Wet Stone, Gunflint, White Pepper (faint), Rarely oaked (natural purity is the point), Smoke, Mineral Complexity, Petrol (aged), Dried Citrus"},
    {id:"provence-rose", name:"Rosé — Provence Style", wtype:"rose", origin:"Provence, France", tagline:"Delicate and fresh — red fruit, flowers, and Mediterranean herbs.", aromas:"Strawberry, Raspberry, Red Cherry, Watermelon, White Peach, Citrus, Rose Petal, Hibiscus, Violet, Herbes de Provence, Dried Lavender, Thyme, Mineral, Chalky, Saline (coastal), White Pepper (faint), Rarely oaked, Dried Rose, Almond (faint)"},
    {id:"champagne", name:"Champagne", wtype:"sparkling", origin:"Champagne, France", tagline:"Bread, citrus, and stone — the most complex and layered sparkling wine.", aromas:"Lemon, Grapefruit, Green Apple, Pear, White Cherry, Peach, Red Berry (Pinot-dominant), White Blossom, Acacia, Chamomile, Fresh Herbs (faint), Chalk, Flint, Wet Stone, Mineral, Ginger, Spice (yeast-derived), Vanilla (if oak-aged), Hazelnut, Cream, Brioche, Toast, Yeast, Biscuit, Honey, Beeswax, Petrol (aged Blanc de Blancs)"},
    {id:"sauternes", name:"Sauternes", wtype:"dessert", origin:"Bordeaux, France", tagline:"Botrytis gold — honey, apricot, and the unmistakable scent of noble rot.", aromas:"Apricot Jam, Peach, Mango, Pineapple, Dried Apricot, Orange Marmalade, Quince, Acacia, Orange Blossom, Jasmine, Saffron (faint), Ginger, Honey, Beeswax, Lanolin, Ginger, Cinnamon, Saffron, Nutmeg, Vanilla, Cream, Toast, Caramel, Crème Brûlée, Honey, Beeswax, Roasted Nuts, Petrol (aged), Dried Fruit Cake"},
    {id:"tokaji", name:"Tokaji Aszú", wtype:"dessert", origin:"Tokaj, Hungary", tagline:"Ancient and complex — apricot, honey, and volcanic mineral depth.", aromas:"Apricot, Peach, Orange Peel, Dried Apricot, Quince, Mandarin, Tropical Fruit, Orange Blossom, Acacia, White Rose, Ginger, Saffron (faint), Volcanic Mineral, Honey, Beeswax, Ginger, Cinnamon, Clove, Saffron, Vanilla, Caramel, Toast, Almond, Honey, Beeswax, Petrol (aged), Roasted Almond, Dried Apricot, Marmalade"},
    {id:"ruby-port", name:"Ruby Port", wtype:"fortified", origin:"Douro Valley, Portugal", tagline:"Dark and fruit-driven — blackberry, chocolate, and dried flowers.", aromas:"Blackberry, Black Cherry, Plum, Dark Cherry, Dried Fig, Raisin, Blackcurrant, Violet, Dried Violet, Rose, Dried Herbs (faint), Chocolate, Mocha, Dark Earth, Cinnamon, Clove, Nutmeg, Anise, Vanilla, Toast, Chocolate, Smoke, Dried Fruit, Fig, Prune, Coffee, Dark Chocolate, Leather"},
    {id:"tawny-port", name:"Tawny Port", wtype:"fortified", origin:"Douro Valley, Portugal", tagline:"Oxidative and nutty — caramel, dried fruit, and rancio complexity.", aromas:"Dried Apricot, Dried Fig, Raisin, Orange Peel, Dates, Prune, Dried Cherry, Dried Rose, Dried Violet, Caramel, Toffee, Coffee, Chocolate, Walnut, Cinnamon, Nutmeg, Clove, Ginger, Allspice, Vanilla, Walnut, Hazelnut, Oxidative Nutty Note (rancio), Caramel, Rancio, Butterscotch, Toffee, Roasted Nuts, Coffee, Dried Fruit Cake, Almond"}
  ];

  const INDEX = [
    ...TOOLS_INDEX.map(t => ({
      type:     'Interactive Tool',
      title:    t.name,
      subtitle: t.sub,
      snippet:  t.snip,
      url:      t.page,
      terms:    norm([t.name, t.sub, t.snip, t.terms].join(' '))
    })),
    ...GRAPES_INDEX.map(g => ({
      type:     'Grape Profile',
      title:    g.name,
      subtitle: g.origin,
      snippet:  g.tagline,
      url:      '/grapes?open=' + g.slug,
      terms:    norm([g.name, g.synonyms, g.origin, g.tagline, 'grape variety wine'].join(' '))
    })),
    ...REGIONS_INDEX.map(r => ({
      type:     'Wine Region',
      title:    r.name,
      subtitle: r.country,
      snippet:  r.tagline,
      url:      '/region-profiles?open=' + r.slug,
      terms:    norm([r.name, r.country, r.tagline, 'wine region appellation'].join(' '))
    })),
    ...CUISINES_INDEX.map(c => ({
      type:     'Cuisine',
      title:    c.name + ' Cuisine',
      subtitle: '16 world cuisines',
      snippet:  c.desc,
      url:      '/cuisine-pairings?cuisine=' + encodeURIComponent(c.name),
      terms:    norm([c.name, c.desc, c.dishnames, 'cuisine food pairing'].join(' '))
    })),
    ...DISHES_INDEX.map(d => ({
      type:     'Dish',
      title:    d.name,
      subtitle: d.cuisine + ' cuisine',
      snippet:  d.desc,
      url:      '/cuisine-pairings?cuisine=' + encodeURIComponent(d.cuisine) + '&dish=' + encodeURIComponent(d.name),
      terms:    norm([d.name, d.cuisine, d.desc, d.flavors, d.wines, 'dish food pairing'].join(' '))
    })),
    ...AROMAS_INDEX.map(a => ({
      type:     'Aroma Profile',
      title:    a.name,
      subtitle: a.origin + ' · ' + a.wtype,
      snippet:  a.tagline,
      url:      '/aromas?open=' + a.id,
      terms:    norm([a.name, a.origin, a.tagline, a.aromas, 'aroma aromas nose smell tasting'].join(' '))
    }))
  ];

  let dataLoaded = false;
  async function loadData() {
    if (dataLoaded) return;
    dataLoaded = true;
    const sources = [
      { url: '/data/wineries.json',    type: 'Winery',            page: '/wineries' },
      { url: '/data/regions.json',     type: 'Region Experience', page: '/regions' },
      { url: '/data/restaurants.json', type: 'Restaurant',        page: '/restaurants' },
      { url: '/data/bottles.json',     type: 'Bottle',            page: '/bottles' },
      { url: '/data/posts.json',       type: 'Post',              page: '/posts' }
    ];
    for (const src of sources) {
      try {
        const r = await fetch(src.url);
        if (!r.ok) continue;
        const data = await r.json();
        const items = Array.isArray(data) ? data :
          (data.items || data.wineries || data.regions || data.restaurants || data.bottles || data.posts || []);
        for (const item of items) {
          if (!item || typeof item !== 'object') continue;
          const name = item.name || item.title || '';
          if (!name) continue;
          INDEX.push({
            type:     src.type,
            title:    name,
            subtitle: item.country || item.location || item.region || item.subtitle || '',
            snippet:  item.excerpt || item.tagline || item.summary || '',
            url:      src.page + '#' + slugify(name),
            terms:    norm(collectStrings(item).join(' '))
          });
        }
      } catch (e) { /* skip */ }
    }
  }

  function search(q) {
    q = norm(q.trim());
    if (!q) return [];
    const tokens = q.split(/\s+/);
    const out = [];
    for (const it of INDEX) {
      let score = 0, all = true;
      const titleLow = norm(it.title);
      const subLow = norm(it.subtitle || '');
      for (const t of tokens) {
        if (titleLow.includes(t))      score += 6;
        else if (subLow.includes(t))   score += 3;
        else if (it.terms.includes(t)) score += 1;
        else { all = false; break; }
      }
      if (all) out.push({ it, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 30).map(r => r.it);
  }

  const CSS = `
    .kc-search-btn { position: fixed; top: 14px; right: 14px; z-index: 9000;
      width: 38px; height: 38px; border-radius: 50%;
      background: #f5f0e8; border: 1px solid #d4c4a8; color: #722F37;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .18s; box-shadow: 0 2px 8px rgba(44,26,14,.08); }
    .kc-search-btn:hover { background: #722F37; color: #fff; border-color: #722F37; }
    .kc-search-btn svg { width: 18px; height: 18px; }
    @media (max-width: 760px) { .kc-search-btn { top: 10px; right: 10px; width: 34px; height: 34px; } }

    .kc-overlay { position: fixed; inset: 0; background: rgba(44,26,14,.55); z-index: 10000;
      display: none; align-items: flex-start; justify-content: center; padding: 60px 16px 16px; }
    .kc-overlay.open { display: flex; }
    .kc-card { width: 100%; max-width: 620px; background: #f5f0e8;
      border: 1px solid #d4c4a8; box-shadow: 0 24px 60px rgba(44,26,14,.3);
      max-height: calc(100vh - 80px); display: flex; flex-direction: column; overflow: hidden; }
    .kc-input { width: 100%; padding: 18px 22px; border: none; background: transparent;
      font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; color: #0a0604;
      outline: none; border-bottom: 1px solid #d4c4a8; }
    .kc-input::placeholder { color: #2c1810; opacity: .5; font-style: italic; }
    .kc-results { overflow-y: auto; flex: 1; }
    .kc-result { padding: 11px 22px; border-bottom: 1px solid #d4c4a8;
      display: block; text-decoration: none; color: inherit; transition: background .12s; cursor: pointer; }
    .kc-result:hover, .kc-result.active { background: #ede8dc; }
    .kc-r-type { font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
      color: #8b6914; font-family: 'Raleway', sans-serif; }
    .kc-r-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 19px;
      color: #2c1810; margin-top: 2px; line-height: 1.2; }
    .kc-r-sub { font-style: italic; font-size: 12px; color: #1a1008; margin-top: 2px;
      font-family: 'Cormorant Garamond', Georgia, serif; }
    .kc-r-snip { font-size: 12px; color: #1a1008; margin-top: 3px; line-height: 1.4;
      font-family: 'Raleway', sans-serif; }
    .kc-empty { padding: 40px 22px; text-align: center; color: #1a1008;
      font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; }
    .kc-hint { padding: 9px 22px; font-size: 10px; color: #2c1810;
      border-top: 1px solid #d4c4a8; display: flex; justify-content: space-between;
      font-family: 'Raleway', sans-serif; letter-spacing: .03em; }
    .kc-hint kbd { background: #ede8dc; border: 1px solid #d4c4a8; padding: 1px 5px;
      border-radius: 3px; font-size: 10px; font-family: inherit; margin: 0 2px; }
  `;

  let overlayEl, inputEl, resultsEl, activeIdx = 0;

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'kc-search-btn';
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    btn.onclick = openOverlay;
    document.body.appendChild(btn);

    overlayEl = document.createElement('div');
    overlayEl.className = 'kc-overlay';
    overlayEl.innerHTML =
      '<div class="kc-card">' +
        '<input class="kc-input" type="search" placeholder="Search grapes, regions, dishes, aromas, tools…" autocomplete="off" spellcheck="false" />' +
        '<div class="kc-results"></div>' +
        '<div class="kc-hint">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>Esc</kbd> close</span>' +
          '<span>Kazmi Cellars</span>' +
        '</div>' +
      '</div>';
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) closeOverlay(); });
    document.body.appendChild(overlayEl);

    inputEl   = overlayEl.querySelector('.kc-input');
    resultsEl = overlayEl.querySelector('.kc-results');
    inputEl.addEventListener('input', render);
    inputEl.addEventListener('keydown', onKey);

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); openOverlay();
      } else if (e.key === '/' && document.activeElement && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); openOverlay();
      }
    });
  }

  async function openOverlay() {
    overlayEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    inputEl.focus(); inputEl.select();
    await loadData();
    if (inputEl.value) render(); else placeholder();
  }
  function closeOverlay() {
    overlayEl.classList.remove('open');
    document.body.style.overflow = '';
  }
  function placeholder() {
    resultsEl.innerHTML = '<div class="kc-empty">Start typing to search grapes, regions, dishes, aromas, tools, and experiences…</div>';
  }
  function render() {
    const q = inputEl.value;
    if (!q.trim()) { placeholder(); return; }
    const hits = search(q);
    activeIdx = 0;
    if (!hits.length) {
      resultsEl.innerHTML = '<div class="kc-empty">No results for "' + esc(q) + '"</div>';
      return;
    }
    resultsEl.innerHTML = hits.map((r, i) =>
      '<a class="kc-result' + (i === 0 ? ' active' : '') + '" href="' + esc(r.url) + '" data-i="' + i + '">' +
        '<div class="kc-r-type">' + esc(r.type) + '</div>' +
        '<div class="kc-r-title">' + esc(r.title) + '</div>' +
        (r.subtitle ? '<div class="kc-r-sub">' + esc(r.subtitle) + '</div>' : '') +
        (r.snippet  ? '<div class="kc-r-snip">' + esc(r.snippet) + '</div>' : '') +
      '</a>'
    ).join('');
  }
  function setActive(i) {
    const items = resultsEl.querySelectorAll('.kc-result');
    if (!items.length) return;
    items.forEach(el => el.classList.remove('active'));
    activeIdx = (i + items.length) % items.length;
    items[activeIdx].classList.add('active');
    items[activeIdx].scrollIntoView({ block: 'nearest' });
  }
  function onKey(e) {
    if (e.key === 'Escape')          { closeOverlay(); }
    else if (e.key === 'ArrowDown')  { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === 'ArrowUp')    { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === 'Enter')      {
      e.preventDefault();
      const items = resultsEl.querySelectorAll('.kc-result');
      if (items[activeIdx]) window.location.href = items[activeIdx].getAttribute('href');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
