/**
 * CleanSpark Booking System - Dynamic Service Forms
 * Fully integrated with backend API
 */

let currentStep = 1;
let selectedService = null;
let mapInstance = null;
let currentMarker = null;
let flatpickrInstance = null;

// ===== HELPER FUNCTIONS =====
function showLoading(show) { 
    let s = document.getElementById('loading-spinner'); 
    if (!s && show) { 
        s = document.createElement('div'); 
        s.id = 'loading-spinner'; 
        s.innerHTML = '<div class="spinner-border text-primary"></div><p style="color:white;margin-top:10px;">Processing...</p>'; 
        s.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(0,0,0,0.7);width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;'; 
        document.body.appendChild(s); 
    } 
    if (s) s.style.display = show ? 'flex' : 'none'; 
}

function showToast(msg, type) { 
    const c = document.querySelector('.toast-container') || (() => { 
        const d = document.createElement('div'); 
        d.className = 'toast-container'; 
        d.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;'; 
        document.body.appendChild(d); 
        return d; 
    })(); 
    const t = document.createElement('div'); 
    t.className = `custom-toast toast-${type}`; 
    t.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${msg}</span><button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`; 
    c.appendChild(t); 
    setTimeout(() => t.remove(), 5000); 
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== SERVICE-SPECIFIC FORM TEMPLATES =====

function getFormTemplateByServiceName(serviceName) {
    const name = serviceName.toLowerCase();
    
    if (name.includes('home') || name.includes('house') || name.includes('residential')) return HOME_CLEANING_FORM;
    if (name.includes('office') || name.includes('corporate') || name.includes('commercial')) return OFFICE_CLEANING_FORM;
    if (name.includes('carpet')) return CARPET_CLEANING_FORM;
    if (name.includes('window')) return WINDOW_CLEANING_FORM;
    if (name.includes('vehicle') || name.includes('car') || name.includes('auto')) return VEHICLE_CLEANING_FORM;
    if (name.includes('pool')) return POOL_CLEANING_FORM;
    if (name.includes('mattress')) return MATTRESS_CLEANING_FORM;
    if (name.includes('upholstery') || name.includes('sofa') || name.includes('furniture')) return UPHOLSTERY_CLEANING_FORM;
    if (name.includes('construction') || name.includes('post-construction') || name.includes('renovation')) return CONSTRUCTION_CLEANING_FORM;
    if (name.includes('hotel') || name.includes('airbnb') || name.includes('guest')) return HOTEL_CLEANING_FORM;
    if (name.includes('laundry') || name.includes('ironing')) return LAUNDRY_CLEANING_FORM;
    if (name.includes('pest') || name.includes('fumigation')) return PEST_CONTROL_FORM;
    if (name.includes('event') || name.includes('party') || name.includes('wedding')) return EVENT_CLEANING_FORM;
    if ((name.includes('refrigerator') || name.includes('ac') || name.includes('air conditioner')) && !name.includes('industrial')) return AC_CLEANING_FORM;
    if (name.includes('industrial') || name.includes('factory') || name.includes('warehouse')) return INDUSTRIAL_CLEANING_FORM;
    if (name.includes('water tank') || name.includes('tank cleaning')) return WATER_TANK_CLEANING_FORM;
    if (name.includes('curtain') || name.includes('drape') || name.includes('blind')) return CURTAIN_CLEANING_FORM;
    if (name.includes('garden') || name.includes('yard') || name.includes('lawn')) return GARDEN_CLEANING_FORM;
    
    return DEFAULT_FORM;
}

// Form Templates (keep all your existing form templates - same as before)
const HOME_CLEANING_FORM = `
    <div class="form-group full-width">
        <label class="form-label">Property Type <span class="required">*</span></label>
        <div class="option-grid" id="propertyGrid">
            <div class="option-card" data-value="apartment"><i class="fas fa-building"></i><span>Apartment</span><small>2+ rooms</small></div>
            <div class="option-card" data-value="house"><i class="fas fa-home"></i><span>House</span><small>Standalone</small></div>
            <div class="option-card" data-value="villa"><i class="fas fa-swimming-pool"></i><span>Villa</span><small>Luxury</small></div>
        </div>
        <input type="hidden" id="property_type">
    </div>
    <div class="form-row">
        <div class="form-group"><label class="form-label">Bedrooms</label><select id="bedrooms" class="form-control"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5+</option></select></div>
        <div class="form-group"><label class="form-label">Bathrooms</label><select id="bathrooms" class="form-control"><option>1</option><option selected>2</option><option>3</option><option>4+</option></select></div>
    </div>
    <div class="form-group full-width">
        <label class="form-label">Dirt Level <span class="required">*</span></label>
        <div class="option-grid" id="dirtGrid">
            <div class="option-card" data-value="light"><i class="fas fa-leaf"></i><span>Light</span><small>Regular maintenance</small></div>
            <div class="option-card selected" data-value="moderate"><i class="fas fa-broom"></i><span>Moderate</span><small>Some deep cleaning</small></div>
            <div class="option-card" data-value="heavy"><i class="fas fa-fire"></i><span>Heavy</span><small>Extensive cleaning</small></div>
        </div>
        <input type="hidden" id="dirt_level" value="moderate">
    </div>
    <div class="form-group"><label class="form-label">Cleaning Frequency</label><select id="cleaning_frequency" class="form-control"><option value="one_time">One-Time</option><option value="weekly">Weekly (Save 10%)</option><option value="monthly">Monthly (Save 5%)</option></select></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Any special requirements..."></textarea></div>
`;

const OFFICE_CLEANING_FORM = `
    <div class="form-group full-width">
        <label class="form-label">Office Type <span class="required">*</span></label>
        <div class="option-grid" id="officeTypeGrid">
            <div class="option-card" data-value="corporate"><i class="fas fa-building"></i><span>Corporate</span><small>Large offices</small></div>
            <div class="option-card" data-value="small"><i class="fas fa-store"></i><span>Small Office</span><small>1-5 rooms</small></div>
            <div class="option-card" data-value="coworking"><i class="fas fa-users"></i><span>Coworking</span><small>Shared space</small></div>
        </div>
        <input type="hidden" id="office_type">
    </div>
    <div class="form-row">
        <div class="form-group"><label class="form-label">Number of Rooms</label><select id="office_rooms" class="form-control"><option>1-2</option><option selected>3-4</option><option>5-6</option><option>7-9</option><option>10+</option></select></div>
        <div class="form-group"><label class="form-label">Workstations</label><select id="workstations" class="form-control"><option>0</option><option>1-5</option><option selected>6-10</option><option>11-15</option><option>16-20</option><option>20+</option></select></div>
    </div>
    <div class="form-group"><label class="form-label">Service Time</label><select id="service_time" class="form-control"><option value="business_hours">Business Hours</option><option value="after_hours">After Hours (+20%)</option><option value="weekend">Weekend (+30%)</option></select></div>
    <div class="form-group"><label class="form-label">Special Requirements</label><textarea id="special_instructions" rows="2" placeholder="Security codes, access instructions..."></textarea></div>
`;

const CARPET_CLEANING_FORM = `
    <div class="form-group"><label class="form-label">Number of Carpets <span class="required">*</span></label><select id="carpet_count" class="form-control"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5+</option></select></div>
    <div class="form-group"><label class="form-label">Carpet Size</label><select id="carpet_size" class="form-control"><option value="small">Small (under 2x3m)</option><option value="medium" selected>Medium (2x3m - 3x4m)</option><option value="large">Large (3x4m - 4x5m)</option><option value="extra_large">Extra Large (5x5m+)</option></select></div>
    <div class="form-group full-width">
        <label class="form-label">Stain Level <span class="required">*</span></label>
        <div class="option-grid" id="stainGrid">
            <div class="option-card" data-value="none"><i class="fas fa-check"></i><span>No Stains</span><small>Clean</small></div>
            <div class="option-card" data-value="light"><i class="fas fa-tint"></i><span>Light Stains</span><small>Minor spots</small></div>
            <div class="option-card selected" data-value="moderate"><i class="fas fa-exclamation-triangle"></i><span>Moderate</span><small>Visible stains</small></div>
            <div class="option-card" data-value="heavy"><i class="fas fa-fire"></i><span>Heavy Stains</span><small>Deep set</small></div>
        </div>
        <input type="hidden" id="stain_level" value="moderate">
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="stain_protection"> Stain Protection (+TZS 15,000)</label><label><input type="checkbox" id="deodorizing"> Deep Deodorizing (+TZS 10,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Furniture to move, delicate areas..."></textarea></div>
`;

const WINDOW_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Number of Windows <span class="required">*</span></label><input type="number" id="window_count" class="form-control" value="5" min="1"></div>
        <div class="form-group"><label class="form-label">Highest Floor</label><select id="max_floor" class="form-control"><option>Ground</option><option>2nd</option><option selected>3rd</option><option>4th</option><option>5th+ (+30%)</option></select></div>
    </div>
    <div class="form-group full-width">
        <label class="form-label">Window Condition</label>
        <div class="option-grid" id="windowConditionGrid">
            <div class="option-card selected" data-value="clean"><i class="fas fa-check"></i><span>Clean</span><small>Light dust</small></div>
            <div class="option-card" data-value="dirty"><i class="fas fa-broom"></i><span>Dirty</span><small>Visible grime</small></div>
            <div class="option-card" data-value="very_dirty"><i class="fas fa-fire"></i><span>Very Dirty</span><small>Heavy buildup</small></div>
        </div>
        <input type="hidden" id="window_condition" value="clean">
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="screen_cleaning"> Screen Cleaning (+TZS 5,000)</label><label><input type="checkbox" id="frame_cleaning"> Frame Cleaning (+TZS 3,000)</label></div>
    <div class="form-group"><label class="form-label">Access Notes</label><textarea id="special_instructions" rows="2" placeholder="Ladder access, hard-to-reach windows..."></textarea></div>
`;

const VEHICLE_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Vehicle Type</label><select id="vehicle_type" class="form-control"><option>Car/Sedan</option><option>SUV/4x4</option><option>Van/Minibus</option><option>Truck</option><option>Motorcycle</option></select></div>
        <div class="form-group"><label class="form-label">Vehicle Size</label><select id="vehicle_size" class="form-control"><option>Small</option><option selected>Medium</option><option>Large</option><option>Extra Large</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="interior_cleaning" checked> Interior Cleaning</label>
        <label><input type="checkbox" id="exterior_wash" checked> Exterior Wash</label>
        <label><input type="checkbox" id="waxing"> Waxing (+TZS 15,000)</label>
        <label><input type="checkbox" id="engine_bay"> Engine Bay (+TZS 10,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Sensitive areas, custom requests..."></textarea></div>
`;

const POOL_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Pool Type</label><select id="pool_type" class="form-control"><option>Residential</option><option>Commercial</option><option>Lap Pool</option><option>Kiddie Pool</option></select></div>
        <div class="form-group"><label class="form-label">Pool Size</label><select id="pool_size" class="form-control"><option>Small (under 20m²)</option><option selected>Medium (20-50m²)</option><option>Large (50-100m²)</option><option>Commercial (100m²+)</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="chemical_balancing" checked> Chemical Balancing</label>
        <label><input type="checkbox" id="filter_cleaning" checked> Filter Cleaning</label>
        <label><input type="checkbox" id="tile_cleaning"> Tile Deep Clean (+TZS 20,000)</label>
        <label><input type="checkbox" id="equipment_check"> Equipment Check (+TZS 15,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Water level, equipment issues..."></textarea></div>
`;

const MATTRESS_CLEANING_FORM = `
    <div class="form-group"><label class="form-label">Number of Mattresses <span class="required">*</span></label><select id="mattress_count" class="form-control"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5+</option></select></div>
    <div class="form-group"><label class="form-label">Mattress Size</label><select id="mattress_size" class="form-control"><option>Single</option><option selected>Double</option><option>Queen</option><option>King</option></select></div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="stain_removal"> Stain Removal (+TZS 10,000)</label>
        <label><input type="checkbox" id="uv_sanitization" checked> UV Sanitization</label>
        <label><input type="checkbox" id="dust_mite"> Dust Mite Treatment (+TZS 8,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Allergies, specific stains..."></textarea></div>
`;

const UPHOLSTERY_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Number of Items</label><select id="upholstery_count" class="form-control"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5+</option></select></div>
        <div class="form-group"><label class="form-label">Item Type</label><select id="upholstery_type" class="form-control"><option>Sofa</option><option>Armchair</option><option>Dining Chair</option><option>Sectional</option></select></div>
    </div>
    <div class="form-group"><label class="form-label">Fabric Type</label><select id="fabric_type" class="form-control"><option>Cotton</option><option>Leather</option><option>Polyester</option><option>Velvet</option><option>Microfiber</option></select></div>
    <div class="checkbox-group"><label><input type="checkbox" id="fabric_protection"> Fabric Protection (+TZS 15,000)</label><label><input type="checkbox" id="deodorizing"> Deodorizing (+TZS 8,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Pet stains, delicate fabric..."></textarea></div>
`;

const CONSTRUCTION_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Property Size</label><select id="property_size" class="form-control"><option>Small (under 100m²)</option><option selected>Medium (100-300m²)</option><option>Large (300-600m²)</option><option>Extra Large (600m²+)</option></select></div>
        <div class="form-group"><label class="form-label">Construction Type</label><select id="construction_type" class="form-control"><option>Renovation</option><option>New Build</option><option>Commercial</option></select></div>
    </div>
    <div class="form-group full-width">
        <label class="form-label">Debris Level</label>
        <div class="option-grid" id="debrisGrid">
            <div class="option-card" data-value="light"><i class="fas fa-broom"></i><span>Light</span><small>Dust only</small></div>
            <div class="option-card selected" data-value="moderate"><i class="fas fa-dumpster"></i><span>Moderate</span><small>Dust & debris</small></div>
            <div class="option-card" data-value="heavy"><i class="fas fa-hard-hat"></i><span>Heavy</span><small>Extensive debris</small></div>
        </div>
        <input type="hidden" id="debris_level" value="moderate">
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="window_cleaning"> Window Cleaning</label><label><input type="checkbox" id="cabinet_cleaning"> Cabinet Cleaning</label><label><input type="checkbox" id="hvac_cleaning"> HVAC/Vent Cleaning</label></div>
    <div class="form-group"><label class="form-label">Special Requirements</label><textarea id="special_instructions" rows="2" placeholder="Safety equipment, working hours..."></textarea></div>
`;

const HOTEL_CLEANING_FORM = `
    <div class="form-group"><label class="form-label">Number of Rooms <span class="required">*</span></label><input type="number" id="room_count" class="form-control" value="5" min="1"></div>
    <div class="form-row">
        <div class="form-group"><label class="form-label">Property Type</label><select id="hotel_type" class="form-control"><option>Hotel</option><option>Airbnb</option><option>Guesthouse</option><option>Lodge</option></select></div>
        <div class="form-group"><label class="form-label">Turnover Type</label><select id="turnover_type" class="form-control"><option value="standard">Standard Stay-over</option><option value="deep">Deep Clean (Check-out)</option><option value="express">Express Turnover</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="linen_change" checked> Linen Change</label>
        <label><input type="checkbox" id="restock_amenities" checked> Restock Amenities</label>
        <label><input type="checkbox" id="deep_bathroom"> Deep Bathroom Clean (+TZS 5,000/room)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Guest preferences, check-out times..."></textarea></div>
`;

const LAUNDRY_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Estimated Loads</label><select id="laundry_loads" class="form-control"><option>1-2 loads</option><option selected>3-4 loads</option><option>5-6 loads</option><option>7+ loads</option></select></div>
        <div class="form-group"><label class="form-label">Service Type</label><select id="laundry_type" class="form-control"><option>Wash & Dry</option><option>Wash, Dry & Fold</option><option>Full Service (incl. Ironing)</option></select></div>
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="delicate_cycle"> Delicate Cycle (+TZS 5,000)</label><label><input type="checkbox" id="stain_treatment"> Stain Treatment (+TZS 8,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Fragile items, specific detergents..."></textarea></div>
`;

const PEST_CONTROL_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Property Size</label><select id="pest_property_size" class="form-control"><option>Small (1-2 rooms)</option><option selected>Medium (3-4 rooms)</option><option>Large (5-6 rooms)</option><option>Commercial</option></select></div>
        <div class="form-group"><label class="form-label">Pest Type</label><select id="pest_type" class="form-control"><option>Cockroaches</option><option>Ants</option><option>Rodents</option><option>Termites</option><option>Bed Bugs</option><option>General</option></select></div>
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="preventive_treatment" checked> Preventive Treatment</label><label><input type="checkbox" id="follow_up_visit"> Follow-up Visit (+TZS 20,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Pets, children, infestation areas..."></textarea></div>
`;

const EVENT_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Event Type</label><select id="event_type" class="form-control"><option>Wedding</option><option>Corporate Event</option><option>Birthday Party</option><option>Conference</option><option>Private Party</option></select></div>
        <div class="form-group"><label class="form-label">Number of Guests</label><select id="guest_count" class="form-control"><option>Under 50</option><option>50-100</option><option>100-200</option><option>200-500</option><option>500+</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="setup_service"> Setup Service</label>
        <label><input type="checkbox" id="cleanup_service" checked> Cleanup Service</label>
        <label><input type="checkbox" id="furniture_arrangement"> Furniture Arrangement (+TZS 15,000)</label>
        <label><input type="checkbox" id="decoration_setup"> Decoration Setup (+TZS 20,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Setup time, floor plan, special requests..."></textarea></div>
`;

const AC_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Number of Units</label><input type="number" id="unit_count" class="form-control" value="2" min="1"></div>
        <div class="form-group"><label class="form-label">Unit Type</label><select id="unit_type" class="form-control"><option>Refrigerator</option><option>AC (Split)</option><option>AC (Window)</option><option>Both</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="filter_cleaning" checked> Filter Cleaning</label>
        <label><input type="checkbox" id="coil_cleaning"> Coil Cleaning (+TZS 15,000)</label>
        <label><input type="checkbox" id="defrosting"> Defrosting (+TZS 10,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Model numbers, access issues..."></textarea></div>
`;

const INDUSTRIAL_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Facility Size</label><select id="facility_size" class="form-control"><option>Small (under 500m²)</option><option selected>Medium (500-2000m²)</option><option>Large (2000-5000m²)</option><option>Extra Large (5000m²+)</option></select></div>
        <div class="form-group"><label class="form-label">Industry Type</label><select id="industry_type" class="form-control"><option>Manufacturing</option><option>Warehouse</option><option>Food Processing</option><option>Pharmaceutical</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="floor_degreasing"> Floor Degreasing</label>
        <label><input type="checkbox" id="machine_cleaning"> Machine Area Cleaning</label>
        <label><input type="checkbox" id="high_pressure"> High-Pressure Washing</label>
    </div>
    <div class="form-group"><label class="form-label">Special Requirements</label><textarea id="special_instructions" rows="2" placeholder="Safety protocols, hazardous areas..."></textarea></div>
`;

const WATER_TANK_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Tank Size</label><select id="tank_size" class="form-control"><option>Small (under 1000L)</option><option selected>Medium (1000-3000L)</option><option>Large (3000-5000L)</option><option>Commercial (5000L+)</option></select></div>
        <div class="form-group"><label class="form-label">Tank Type</label><select id="tank_type" class="form-control"><option>Roof Tank</option><option>Ground Tank</option><option>Underground</option><option>Plastic</option><option>Concrete</option></select></div>
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="disinfection" checked> Disinfection</label><label><input type="checkbox" id="water_testing"> Water Quality Testing (+TZS 10,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Access to tank, water supply shutdown..."></textarea></div>
`;

const CURTAIN_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Number of Curtains</label><select id="curtain_count" class="form-control"><option>1-2</option><option selected>3-4</option><option>5-6</option><option>7-8</option><option>9+</option></select></div>
        <div class="form-group"><label class="form-label">Curtain Type</label><select id="curtain_type" class="form-control"><option>Cotton</option><option>Polyester</option><option>Silk</option><option>Velvet</option><option>Blackout</option></select></div>
    </div>
    <div class="checkbox-group"><label><input type="checkbox" id="curtain_removal"> Removal & Rehanging (+TZS 15,000)</label><label><input type="checkbox" id="steam_ironing"> Steam Ironing (+TZS 10,000)</label></div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Height, rail type, delicate fabric..."></textarea></div>
`;

const GARDEN_CLEANING_FORM = `
    <div class="form-row">
        <div class="form-group"><label class="form-label">Garden Size</label><select id="garden_size" class="form-control"><option>Small</option><option selected>Medium</option><option>Large</option><option>Estate</option></select></div>
        <div class="form-group"><label class="form-label">Service Type</label><select id="garden_service" class="form-control"><option>Basic Cleaning</option><option>Full Maintenance</option><option>One-Time Cleanup</option></select></div>
    </div>
    <div class="checkbox-group">
        <label><input type="checkbox" id="lawn_mowing" checked> Lawn Mowing</label>
        <label><input type="checkbox" id="weed_removal" checked> Weed Removal</label>
        <label><input type="checkbox" id="hedge_trimming"> Hedge Trimming (+TZS 15,000)</label>
        <label><input type="checkbox" id="waste_removal"> Waste Removal (+TZS 10,000)</label>
    </div>
    <div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" placeholder="Tools, specific plants, access..."></textarea></div>
`;

const DEFAULT_FORM = `<div class="form-group"><label class="form-label">Service Details</label><textarea id="service_details" rows="4" class="form-control" placeholder="Please describe your requirements..."></textarea></div><div class="form-group"><label class="form-label">Special Instructions</label><textarea id="special_instructions" rows="2" class="form-control"></textarea></div>`;

// ===== LOAD SELECTED SERVICE =====
async function loadSelectedService() {
    const serviceData = localStorage.getItem('selectedService');
    if (!serviceData) { 
        showToast('Please select a service first', 'error'); 
        setTimeout(() => window.location.href = 'service.html', 1500); 
        return; 
    }
    
    selectedService = JSON.parse(serviceData);
    
    try {
        showLoading(true);
        const response = await API.services.getById(selectedService.id);
        showLoading(false);
        
        if (response.service) {
            selectedService.name = response.service.name;
            selectedService.description = response.service.description;
            selectedService.location = response.service.location;
            selectedService.basePrice = 50000;
        } else {
            selectedService.basePrice = 50000;
        }
    } catch (error) {
        showLoading(false);
        console.error('Error fetching service details:', error);
        selectedService.basePrice = 50000;
    }
    
    // Ensure basePrice is a valid number
    if (isNaN(selectedService.basePrice) || selectedService.basePrice === undefined) {
        selectedService.basePrice = 50000;
    }
    
    document.getElementById('selectedServiceBanner').style.display = 'flex';
    document.getElementById('selectedServiceName').innerText = selectedService.name;
    document.getElementById('phase1Title').innerText = selectedService.name + ' Details';
    
    const dynamicForm = document.getElementById('dynamicServiceForm');
    if (dynamicForm) {
        const formTemplate = getFormTemplateByServiceName(selectedService.name);
        dynamicForm.innerHTML = formTemplate;
        initializeFormInteractions();
    }
    
    updatePriceEstimate();
}

function initializeFormInteractions() {
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const hiddenInput = parent.nextElementSibling;
            if (hiddenInput && hiddenInput.type === 'hidden') hiddenInput.value = this.dataset.value;
            updatePriceEstimate();
        });
    });
    
    const inputs = ['bedrooms', 'bathrooms', 'cleaning_frequency', 'carpet_count', 'carpet_size', 'window_count', 'max_floor', 'room_count', 'unit_count', 'mattress_count', 'upholstery_count', 'laundry_loads', 'guest_count', 'facility_size', 'tank_size', 'curtain_count', 'garden_size'];
    inputs.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', updatePriceEstimate); });
    
    document.querySelectorAll('.checkbox-group input').forEach(cb => cb.addEventListener('change', updatePriceEstimate));
}

function updatePriceEstimate() {
    if (!selectedService) return 50000;
    let total = selectedService.basePrice || 50000;
    const serviceName = selectedService.name.toLowerCase();
    
    if (serviceName.includes('home') || serviceName.includes('house')) {
        const bedrooms = parseInt(document.getElementById('bedrooms')?.value || 2);
        const bathrooms = parseInt(document.getElementById('bathrooms')?.value || 2);
        const dirtLevel = document.getElementById('dirt_level')?.value || 'moderate';
        const frequency = document.getElementById('cleaning_frequency')?.value || 'one_time';
        if (bedrooms > 2) total += (bedrooms - 2) * 5000;
        if (bathrooms > 2) total += (bathrooms - 2) * 3000;
        if (dirtLevel === 'moderate') total += 5000;
        if (dirtLevel === 'heavy') total += 15000;
        if (frequency === 'weekly') total *= 0.9;
        if (frequency === 'monthly') total *= 0.95;
    }
    
    if (serviceName.includes('office') || serviceName.includes('corporate')) {
        const officeRooms = parseInt(document.getElementById('office_rooms')?.selectedIndex + 1 || 2);
        const workstations = parseInt(document.getElementById('workstations')?.selectedIndex + 1 || 2);
        const serviceTime = document.getElementById('service_time')?.value || 'business_hours';
        total += (officeRooms - 2) * 10000;
        total += (workstations - 2) * 5000;
        if (serviceTime === 'after_hours') total *= 1.2;
        if (serviceTime === 'weekend') total *= 1.3;
    }
    
    if (serviceName.includes('carpet')) {
        const carpetCount = parseInt(document.getElementById('carpet_count')?.value || 2);
        const carpetSize = document.getElementById('carpet_size')?.value || 'medium';
        const stainLevel = document.getElementById('stain_level')?.value || 'moderate';
        let sizeMultiplier = carpetSize === 'small' ? 0.7 : carpetSize === 'medium' ? 1 : carpetSize === 'large' ? 1.4 : 1.8;
        let stainMultiplier = stainLevel === 'light' ? 1.1 : stainLevel === 'moderate' ? 1.3 : stainLevel === 'heavy' ? 1.6 : 1;
        total = 40000 * carpetCount * sizeMultiplier * stainMultiplier;
        if (document.getElementById('stain_protection')?.checked) total += 15000;
        if (document.getElementById('deodorizing')?.checked) total += 10000;
    }
    
    if (serviceName.includes('window')) {
        const windowCount = parseInt(document.getElementById('window_count')?.value || 5);
        const maxFloor = parseInt(document.getElementById('max_floor')?.selectedIndex + 1 || 3);
        const condition = document.getElementById('window_condition')?.value || 'clean';
        total = 20000 + (windowCount * 2000);
        if (maxFloor >= 5) total *= 1.3;
        else if (maxFloor >= 3) total *= 1.15;
        if (condition === 'dirty') total *= 1.2;
        if (condition === 'very_dirty') total *= 1.4;
        if (document.getElementById('screen_cleaning')?.checked) total += 5000;
        if (document.getElementById('frame_cleaning')?.checked) total += 3000;
    }
    
    if (serviceName.includes('hotel') || serviceName.includes('airbnb')) {
        const roomCount = parseInt(document.getElementById('room_count')?.value || 5);
        const turnoverType = document.getElementById('turnover_type')?.value || 'standard';
        total = 40000 + (roomCount * 10000);
        if (turnoverType === 'deep') total *= 1.5;
        if (turnoverType === 'express') total *= 1.3;
        if (document.getElementById('deep_bathroom')?.checked) total += roomCount * 5000;
    }
    
    if ((serviceName.includes('refrigerator') || serviceName.includes('ac')) && !serviceName.includes('industrial')) {
        const unitCount = parseInt(document.getElementById('unit_count')?.value || 2);
        total = 25000 + (unitCount * 10000);
        if (document.getElementById('coil_cleaning')?.checked) total += 15000;
        if (document.getElementById('defrosting')?.checked) total += 10000;
    }
    
    if (serviceName.includes('water tank')) {
        const tankSize = document.getElementById('tank_size')?.value || 'medium';
        if (tankSize === 'small') total = 50000;
        if (tankSize === 'medium') total = 70000;
        if (tankSize === 'large') total = 90000;
        if (tankSize === 'Commercial') total = 120000;
        if (document.getElementById('water_testing')?.checked) total += 10000;
    }
    
    if (serviceName.includes('garden') || serviceName.includes('yard')) {
        const gardenSize = document.getElementById('garden_size')?.value || 'medium';
        if (gardenSize === 'small') total = 35000;
        if (gardenSize === 'medium') total = 55000;
        if (gardenSize === 'large') total = 80000;
        if (gardenSize === 'estate') total = 120000;
        if (document.getElementById('hedge_trimming')?.checked) total += 15000;
        if (document.getElementById('waste_removal')?.checked) total += 10000;
    }
    
    total = Math.round(total);
    document.getElementById('totalPrice').innerText = `TZS ${total.toLocaleString()}`;
    return total;
}

// ===== VALIDATION =====
function validateCurrentPhase() {
    switch(currentStep) {
        case 1:
            return true;
        case 2:
            const date = document.getElementById('preferredDate')?.value;
            const time = document.getElementById('preferredTime')?.value;
            if (!date) { showToast('Please select a date', 'error'); return false; }
            if (!time) { showToast('Please select a time', 'error'); return false; }
            return true;
        case 3:
            const firstName = document.getElementById('first_name')?.value.trim();
            const lastName = document.getElementById('last_name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            if (!firstName) { showToast('Enter first name', 'error'); return false; }
            if (!lastName) { showToast('Enter last name', 'error'); return false; }
            if (!email) { showToast('Enter email', 'error'); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Valid email required', 'error'); return false; }
            if (!phone) { showToast('Enter phone number', 'error'); return false; }
            return true;
        case 4:
            const address = document.getElementById('address')?.value.trim();
            const area = document.getElementById('area_district')?.value.trim();
            const city = document.getElementById('city')?.value.trim();
            const lat = document.getElementById('latitude')?.value;
            if (!address) { showToast('Enter address', 'error'); return false; }
            if (!area) { showToast('Enter area/district', 'error'); return false; }
            if (!city) { showToast('Enter city', 'error'); return false; }
            if (!lat) { showToast('Pin location on map', 'error'); return false; }
            return true;
        default: return true;
    }
}

// ===== PHASE NAVIGATION =====
function nextPhase() { 
    if (currentStep < 5 && validateCurrentPhase()) {
        currentStep++;
        updatePhaseDisplay();
        updateProgressBar();
        if (currentStep === 5) updateReview();
        if (currentStep === 4 && mapInstance) setTimeout(() => mapInstance.invalidateSize(), 100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevPhase() { 
    if (currentStep > 1) {
        currentStep--;
        updatePhaseDisplay();
        updateProgressBar();
        if (currentStep === 5) updateReview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updatePhaseDisplay() { 
    for (let i = 1; i <= 5; i++) { 
        const phase = document.getElementById(`phase${i}`); 
        const step = document.querySelector(`.step[data-step="${i}"]`); 
        if (phase) i === currentStep ? phase.classList.add('active') : phase.classList.remove('active'); 
        if (step) i === currentStep ? step.classList.add('active') : step.classList.remove('active'); 
    } 
}

function updateProgressBar() { 
    const progress = ((currentStep - 1) / 4) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`; 
}

function updateReview() {
    const container = document.getElementById('reviewContent');
    if (!container) return;
    const total = updatePriceEstimate();
    
    container.innerHTML = `
        <h4><i class="fas fa-broom"></i> ${escapeHtml(selectedService?.name || 'Service')}</h4>
        <h4 class="mt-3"><i class="fas fa-calendar"></i> Schedule</h4>
        <div class="review-item"><span class="review-label">Date:</span><span class="review-value">${document.getElementById('preferredDate')?.value || 'Not selected'}</span></div>
        <div class="review-item"><span class="review-label">Time:</span><span class="review-value">${document.getElementById('preferredTime')?.options[document.getElementById('preferredTime')?.selectedIndex]?.text || 'Not selected'}</span></div>
        <div class="review-item"><span class="review-label">Instructions:</span><span class="review-value">${escapeHtml(document.getElementById('instructions')?.value || 'None')}</span></div>
        <h4 class="mt-3"><i class="fas fa-user"></i> Customer</h4>
        <div class="review-item"><span class="review-label">Name:</span><span class="review-value">${escapeHtml(document.getElementById('first_name')?.value || '')} ${escapeHtml(document.getElementById('last_name')?.value || '')}</span></div>
        <div class="review-item"><span class="review-label">Email:</span><span class="review-value">${escapeHtml(document.getElementById('email')?.value || '')}</span></div>
        <div class="review-item"><span class="review-label">Phone:</span><span class="review-value">${escapeHtml(document.getElementById('phone')?.value || '')}</span></div>
        <h4 class="mt-3"><i class="fas fa-map-marker-alt"></i> Location</h4>
        <div class="review-item"><span class="review-label">Address:</span><span class="review-value">${escapeHtml(document.getElementById('address')?.value || '')}, ${escapeHtml(document.getElementById('area_district')?.value || '')}, ${escapeHtml(document.getElementById('city')?.value || '')}</span></div>
        <div class="review-item total mt-3"><span class="review-label">Total:</span><span class="review-value" style="color: var(--primary); font-weight: 800;">TZS ${total.toLocaleString()}</span></div>
        <p class="text-muted small mt-2"><i class="fas fa-info-circle"></i> Final invoice after admin review</p>
    `;
}

// ===== MAP =====
function initializeMap() {
    const container = document.getElementById('locationMap');
    if (!container) return;
    mapInstance = L.map('locationMap').setView([-6.1659, 39.2026], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);
    mapInstance.on('click', e => placeMarker(e.latlng.lat, e.latlng.lng));
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => { mapInstance.setView([p.coords.latitude, p.coords.longitude], 15); placeMarker(p.coords.latitude, p.coords.longitude); }, () => {});
}

function placeMarker(lat, lng) {
    if (currentMarker) mapInstance.removeLayer(currentMarker);
    currentMarker = L.marker([lat, lng]).addTo(mapInstance);
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);
    document.getElementById('pin_latitude').value = lat.toFixed(6);
    document.getElementById('pin_longitude').value = lng.toFixed(6);
}

function initializeDatePicker() {
    const input = document.getElementById('preferredDate');
    if (!input) return;
    if (flatpickrInstance) flatpickrInstance.destroy();
    flatpickrInstance = flatpickr(input, { minDate: "today", dateFormat: "Y-m-d" });
}

// ===== SUBMIT BOOKING TO BACKEND API =====
async function submitBooking() {
    if (!validateCurrentPhase()) return;
    showLoading(true);
    
    const total = updatePriceEstimate();
    const basePrice = 50000;
    const extras = Math.max(0, total - basePrice);
    
    const bookingData = {
        service_id: parseInt(selectedService.id),
        cleaners: 2,
        hours: 3,
        frequency: 'one-time',
        materials: false,
        property_type: document.getElementById('property_type')?.value || 'apartment',
        property_type_detail: null,
        bedrooms: parseInt(document.getElementById('bedrooms')?.value) || null,
        bathrooms: parseInt(document.getElementById('bathrooms')?.value) || null,
        dirt_level: document.getElementById('dirt_level')?.value || 'moderate',
        cleaning_frequency: document.getElementById('cleaning_frequency')?.value || 'one_time',
        address: document.getElementById('address')?.value.trim(),
        area_district: document.getElementById('area_district')?.value.trim() || '',
        city: document.getElementById('city')?.value.trim(),
        region: document.getElementById('region')?.value || null,
        landmark: document.getElementById('landmark')?.value.trim() || null,
        building_name: null,
        floor_number: null,
        latitude: parseFloat(document.getElementById('latitude')?.value) || null,
        longitude: parseFloat(document.getElementById('longitude')?.value) || null,
        pin_latitude: parseFloat(document.getElementById('pin_latitude')?.value) || null,
        pin_longitude: parseFloat(document.getElementById('pin_longitude')?.value) || null,
        service_date: document.getElementById('preferredDate')?.value,
        service_time: document.getElementById('preferredTime')?.value,
        instructions: document.getElementById('instructions')?.value.trim() || null,
        special_instructions_cleaners: document.getElementById('special_instructions')?.value.trim() || null,
        first_name: document.getElementById('first_name')?.value.trim(),
        last_name: document.getElementById('last_name')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        phone: document.getElementById('phone')?.value.trim(),
        alternative_phone: document.getElementById('alternative_phone')?.value.trim() || null,
        preferred_communication: document.getElementById('preferred_communication')?.value || 'email',
        payment_method: 'cash',
        base_price: basePrice,
        extras: extras,
        discount: 0,
        total_price: total,
        estimated_service_cost: null,
        labor_cost: null,
        transport_cost: null,
        equipment_cost_admin: null,
        tax_rate_admin: null,
        tax_amount_admin: null,
        discount_admin: null,
        final_total: null,
        status: 'pending',
        payment_status: 'unpaid',
        estimation_status: 'pending'
    };
    
    console.log('Submitting booking:', bookingData);
    
    try {
        const response = await API.bookings.create(bookingData);
        showLoading(false);
        console.log('Response:', response);
        
        if (response.success === true || response.booking || response.message === 'Booking created successfully' || (response.message && response.message.includes('Booking created'))) {
            localStorage.removeItem('selectedService');
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        } else {
            showToast(response.message || 'Booking failed', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Booking error:', error);
        showToast(error.message || 'Submission failed. Please try again.', 'error');
    }
}

// ===== THEME TOGGLE =====
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadSelectedService();
    initializeDatePicker();
    initializeMap();
    
    document.getElementById('nextPhase1Btn')?.addEventListener('click', nextPhase);
    document.getElementById('prevPhase2Btn')?.addEventListener('click', prevPhase);
    document.getElementById('nextPhase2Btn')?.addEventListener('click', nextPhase);
    document.getElementById('prevPhase3Btn')?.addEventListener('click', prevPhase);
    document.getElementById('nextPhase3Btn')?.addEventListener('click', nextPhase);
    document.getElementById('prevPhase4Btn')?.addEventListener('click', prevPhase);
    document.getElementById('nextPhase4Btn')?.addEventListener('click', nextPhase);
    document.getElementById('prevPhase5Btn')?.addEventListener('click', prevPhase);
    document.getElementById('submitBookingBtn')?.addEventListener('click', submitBooking);
    
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', function() { 
            const targetStep = parseInt(this.dataset.step);
            if (targetStep < currentStep) {
                currentStep = targetStep;
                updatePhaseDisplay();
                updateProgressBar();
                if (targetStep === 5) updateReview();
                if (targetStep === 4 && mapInstance) setTimeout(() => mapInstance.invalidateSize(), 100);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (targetStep === currentStep + 1 && validateCurrentPhase()) {
                currentStep = targetStep;
                updatePhaseDisplay();
                updateProgressBar();
                if (targetStep === 5) updateReview();
                if (targetStep === 4 && mapInstance) setTimeout(() => mapInstance.invalidateSize(), 100);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
});