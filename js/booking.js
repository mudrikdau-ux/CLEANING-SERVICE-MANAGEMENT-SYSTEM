// ========== PROFESSIONAL BOOKING SYSTEM WITH SERVICE-SPECIFIC FORMS ==========
// FULLY FIXED - All functionality working

let currentStep = 1;
let selectedService = null;
let mapInstance = null;
let currentMarker = null;
let bookedDates = [];
let flatpickrInstance = null;

// Service configuration with specific form templates
const SERVICE_CONFIGS = {
    // Residential Services
    home_cleaning: {
        name: 'Home Cleaning',
        category: 'residential',
        icon: '🏠',
        basePrice: 50000,
        description: 'Complete home cleaning service for your residence',
        formTemplate: 'homeCleaning',
        validation: validateHomeCleaning,
        getPrice: calculateHomeCleaningPrice,
        duration: '2-4 hours'
    },
    apartment_cleaning: {
        name: 'Apartment Cleaning',
        category: 'residential',
        icon: '🏢',
        basePrice: 45000,
        description: 'Specialized cleaning for apartments and condos',
        formTemplate: 'homeCleaning',
        validation: validateHomeCleaning,
        getPrice: calculateHomeCleaningPrice,
        duration: '2-3 hours'
    },
    deep_cleaning: {
        name: 'Deep Cleaning',
        category: 'residential',
        icon: '🔍',
        basePrice: 75000,
        description: 'Intensive deep cleaning for every corner',
        formTemplate: 'deepCleaning',
        validation: validateDeepCleaning,
        getPrice: calculateDeepCleaningPrice,
        duration: '4-6 hours'
    },
    
    // Commercial Services
    office_cleaning: {
        name: 'Office Cleaning',
        category: 'commercial',
        icon: '🏢',
        basePrice: 75000,
        description: 'Professional office cleaning for workplaces',
        formTemplate: 'officeCleaning',
        validation: validateOfficeCleaning,
        getPrice: calculateOfficeCleaningPrice,
        duration: '3-4 hours'
    },
    hotel_cleaning: {
        name: 'Hotel & Airbnb Cleaning',
        category: 'commercial',
        icon: '🏨',
        basePrice: 100000,
        description: 'Professional cleaning for hotels and short-stay properties',
        formTemplate: 'hotelCleaning',
        validation: validateHotelCleaning,
        getPrice: calculateHotelCleaningPrice,
        duration: '2-4 hours'
    },
    industrial_cleaning: {
        name: 'Industrial Cleaning',
        category: 'commercial',
        icon: '🏭',
        basePrice: 120000,
        description: 'Heavy-duty cleaning for industrial spaces',
        formTemplate: 'industrialCleaning',
        validation: validateIndustrialCleaning,
        getPrice: calculateIndustrialCleaningPrice,
        duration: '4-8 hours'
    },
    
    // Specialized Services
    carpet_cleaning: {
        name: 'Carpet Cleaning',
        category: 'specialized',
        icon: '🪑',
        basePrice: 60000,
        description: 'Deep carpet cleaning and stain removal',
        formTemplate: 'carpetCleaning',
        validation: validateCarpetCleaning,
        getPrice: calculateCarpetCleaningPrice,
        duration: '1-2 hours per room'
    },
    window_cleaning: {
        name: 'Window Cleaning',
        category: 'specialized',
        icon: '🪟',
        basePrice: 40000,
        description: 'Professional streak-free window cleaning',
        formTemplate: 'windowCleaning',
        validation: validateWindowCleaning,
        getPrice: calculateWindowCleaningPrice,
        duration: '1-3 hours'
    },
    vehicle_cleaning: {
        name: 'Vehicle Cleaning',
        category: 'specialized',
        icon: '🚗',
        basePrice: 45000,
        description: 'Complete interior and exterior vehicle cleaning',
        formTemplate: 'vehicleCleaning',
        validation: validateVehicleCleaning,
        getPrice: calculateVehicleCleaningPrice,
        duration: '1-2 hours'
    },
    pool_cleaning: {
        name: 'Pool Cleaning',
        category: 'specialized',
        icon: '🏊',
        basePrice: 80000,
        description: 'Professional pool cleaning and maintenance',
        formTemplate: 'poolCleaning',
        validation: validatePoolCleaning,
        getPrice: calculatePoolCleaningPrice,
        duration: '2-3 hours'
    },
    mattress_cleaning: {
        name: 'Mattress Cleaning',
        category: 'specialized',
        icon: '🛏️',
        basePrice: 55000,
        description: 'Deep mattress cleaning and sanitization',
        formTemplate: 'mattressCleaning',
        validation: validateMattressCleaning,
        getPrice: calculateMattressCleaningPrice,
        duration: '1 hour per mattress'
    },
    upholstery_cleaning: {
        name: 'Upholstery Cleaning',
        category: 'specialized',
        icon: '🛋️',
        basePrice: 65000,
        description: 'Professional furniture and upholstery cleaning',
        formTemplate: 'upholsteryCleaning',
        validation: validateUpholsteryCleaning,
        getPrice: calculateUpholsteryCleaningPrice,
        duration: '2-3 hours'
    },
    move_cleaning: {
        name: 'Move-In/Out Cleaning',
        category: 'specialized',
        icon: '🚚',
        basePrice: 70000,
        description: 'Complete cleaning for moving in or out',
        formTemplate: 'moveCleaning',
        validation: validateMoveCleaning,
        getPrice: calculateMoveCleaningPrice,
        duration: '3-5 hours'
    },
    construction_cleaning: {
        name: 'Post Construction Cleaning',
        category: 'specialized',
        icon: '🏗️',
        basePrice: 90000,
        description: 'Complete cleaning after construction',
        formTemplate: 'constructionCleaning',
        validation: validateConstructionCleaning,
        getPrice: calculateConstructionCleaningPrice,
        duration: '4-6 hours'
    },
    laundry_service: {
        name: 'Laundry & Ironing',
        category: 'specialized',
        icon: '👕',
        basePrice: 54000,
        description: 'Professional laundry and ironing service',
        formTemplate: 'laundryCleaning',
        validation: validateLaundryCleaning,
        getPrice: calculateLaundryCleaningPrice,
        duration: '24-hour turnaround'
    },
    pest_control: {
        name: 'Pest Control',
        category: 'specialized',
        icon: '🐜',
        basePrice: 54000,
        description: 'Effective pest elimination and prevention',
        formTemplate: 'pestControl',
        validation: validatePestControl,
        getPrice: calculatePestControlPrice,
        duration: '1-2 hours'
    },
    event_cleaning: {
        name: 'Event Setup & Cleanup',
        category: 'commercial',
        icon: '🎉',
        basePrice: 90000,
        description: 'Event setup and complete cleanup',
        formTemplate: 'eventCleaning',
        validation: validateEventCleaning,
        getPrice: calculateEventCleaningPrice,
        duration: '3-6 hours'
    },
    ac_cleaning: {
        name: 'AC & Refrigerator Cleaning',
        category: 'specialized',
        icon: '❄️',
        basePrice: 45000,
        description: 'AC and refrigerator cleaning service',
        formTemplate: 'acCleaning',
        validation: validateAcCleaning,
        getPrice: calculateAcCleaningPrice,
        duration: '1-2 hours'
    },
    water_tank_cleaning: {
        name: 'Water Tank Cleaning',
        category: 'specialized',
        icon: '💧',
        basePrice: 70000,
        description: 'Professional water tank cleaning',
        formTemplate: 'waterTankCleaning',
        validation: validateWaterTankCleaning,
        getPrice: calculateWaterTankCleaningPrice,
        duration: '2-3 hours'
    },
    curtain_cleaning: {
        name: 'Curtain Cleaning',
        category: 'specialized',
        icon: '🪟',
        basePrice: 40000,
        description: 'Professional curtain cleaning service',
        formTemplate: 'curtainCleaning',
        validation: validateCurtainCleaning,
        getPrice: calculateCurtainCleaningPrice,
        duration: '2-3 hours'
    },
    garden_cleaning: {
        name: 'Garden Cleaning',
        category: 'specialized',
        icon: '🌿',
        basePrice: 55000,
        description: 'Professional garden cleaning and maintenance',
        formTemplate: 'gardenCleaning',
        validation: validateGardenCleaning,
        getPrice: calculateGardenCleaningPrice,
        duration: '2-4 hours'
    }
};

// Service-specific form templates (HTML strings)
const FORM_TEMPLATES = {
    homeCleaning: `
        <div class="form-group full-width">
            <label class="form-label">Property Type <span class="required">*</span></label>
            <div class="property-type-grid" id="propertyTypeGrid">
                <div class="property-option" data-type="apartment">
                    <i class="fas fa-building"></i>
                    <span>Apartment</span>
                </div>
                <div class="property-option" data-type="house">
                    <i class="fas fa-home"></i>
                    <span>House</span>
                </div>
                <div class="property-option" data-type="villa">
                    <i class="fas fa-swimming-pool"></i>
                    <span>Villa</span>
                </div>
                <div class="property-option" data-type="studio">
                    <i class="fas fa-door-open"></i>
                    <span>Studio</span>
                </div>
            </div>
            <input type="hidden" id="propertyType" value="">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Number of Bedrooms</label>
                <select id="bedrooms" class="form-control">
                    <option value="0">0 (Studio/No bedroom)</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Number of Bathrooms</label>
                <select id="bathrooms" class="form-control">
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4+ Bathrooms</option>
                </select>
            </div>
        </div>

        <div class="form-group full-width">
            <label class="form-label">Dirt Level <span class="required">*</span></label>
            <div class="dirt-level-grid" id="dirtLevelGrid">
                <div class="dirt-option" data-level="light">
                    <i class="fas fa-leaf"></i>
                    <strong>Light</strong>
                    <small>Regular maintenance needed</small>
                </div>
                <div class="dirt-option" data-level="moderate">
                    <i class="fas fa-broom"></i>
                    <strong>Moderate</strong>
                    <small>Some deep cleaning required</small>
                </div>
                <div class="dirt-option" data-level="heavy">
                    <i class="fas fa-fire"></i>
                    <strong>Heavy</strong>
                    <small>Extensive deep cleaning needed</small>
                </div>
            </div>
            <input type="hidden" id="dirtLevel" value="">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Cleaning Frequency</label>
                <select id="frequency" class="form-control">
                    <option value="one_time">One-Time Cleaning</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Save 10%)</option>
                    <option value="biweekly">Bi-Weekly (Save 15%)</option>
                    <option value="monthly">Monthly (Save 20%)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Number of Cleaners</label>
                <select id="cleaners" class="form-control">
                    <option value="1">1 Cleaner</option>
                    <option value="2">2 Cleaners</option>
                    <option value="3">3 Cleaners</option>
                    <option value="4">4+ Cleaners</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Special Instructions</label>
            <textarea id="specialInstructions" class="form-control" rows="3" placeholder="Any areas needing special attention, pets, access instructions..."></textarea>
        </div>
    `,

    officeCleaning: `
        <div class="form-group full-width">
            <label class="form-label">Office Type <span class="required">*</span></label>
            <div class="office-type-grid" id="officeTypeGrid">
                <div class="office-option" data-type="corporate">
                    <i class="fas fa-building"></i>
                    <span>Corporate Office</span>
                </div>
                <div class="office-option" data-type="small">
                    <i class="fas fa-store"></i>
                    <span>Small Office</span>
                </div>
                <div class="office-option" data-type="coworking">
                    <i class="fas fa-users"></i>
                    <span>Coworking Space</span>
                </div>
                <div class="office-option" data-type="medical">
                    <i class="fas fa-hospital"></i>
                    <span>Medical Office</span>
                </div>
            </div>
            <input type="hidden" id="officeType" value="">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Number of Rooms/Sections</label>
                <select id="officeRooms" class="form-control">
                    <option value="1">1-2 Rooms</option>
                    <option value="2">3-4 Rooms</option>
                    <option value="3">5-6 Rooms</option>
                    <option value="4">7-9 Rooms</option>
                    <option value="5">10+ Rooms</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Number of Workstations</label>
                <select id="workstations" class="form-control">
                    <option value="0">No dedicated workstations</option>
                    <option value="5">1-5 Workstations</option>
                    <option value="10">6-10 Workstations</option>
                    <option value="15">11-15 Workstations</option>
                    <option value="20">16-20 Workstations</option>
                    <option value="25">20+ Workstations</option>
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Cleaning Frequency</label>
                <select id="frequency" class="form-control">
                    <option value="one_time">One-Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Service Time</label>
                <select id="serviceTime" class="form-control">
                    <option value="business_hours">During Business Hours</option>
                    <option value="after_hours">After Hours (Additional 20%)</option>
                    <option value="weekend">Weekend (Additional 30%)</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Security/Access Notes</label>
            <textarea id="securityNotes" class="form-control" rows="2" placeholder="Access codes, security procedures, cleaning after hours instructions..."></textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Special Requirements</label>
            <textarea id="specialRequirements" class="form-control" rows="2" placeholder="Any special cleaning requirements or areas of focus..."></textarea>
        </div>
    `,

    carpetCleaning: `
        <div class="form-group full-width">
            <label class="form-label">Carpet Type <span class="required">*</span></label>
            <div class="carpet-type-grid" id="carpetTypeGrid">
                <div class="carpet-option" data-type="wool">
                    <i class="fas fa-tshirt"></i>
                    <span>Wool</span>
                </div>
                <div class="carpet-option" data-type="synthetic">
                    <i class="fas fa-industry"></i>
                    <span>Synthetic</span>
                </div>
                <div class="carpet-option" data-type="berber">
                    <i class="fas fa-th-large"></i>
                    <span>Berber</span>
                </div>
                <div class="carpet-option" data-type="sisal">
                    <i class="fas fa-leaf"></i>
                    <span>Sisal</span>
                </div>
            </div>
            <input type="hidden" id="carpetType" value="">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Number of Carpets</label>
                <select id="carpetCount" class="form-control">
                    <option value="1">1 Carpet</option>
                    <option value="2">2 Carpets</option>
                    <option value="3">3 Carpets</option>
                    <option value="4">4 Carpets</option>
                    <option value="5">5+ Carpets</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Carpet Size</label>
                <select id="carpetSize" class="form-control">
                    <option value="small">Small (under 2x3m)</option>
                    <option value="medium">Medium (2x3m - 3x4m)</option>
                    <option value="large">Large (3x4m - 4x5m)</option>
                    <option value="extra_large">Extra Large (5x5m+)</option>
                </select>
            </div>
        </div>

        <div class="form-group full-width">
            <label class="form-label">Stain Level <span class="required">*</span></label>
            <div class="stain-level-grid" id="stainLevelGrid">
                <div class="stain-option" data-level="none">
                    <i class="fas fa-check-circle"></i>
                    <strong>No Stains</strong>
                    <small>Regular cleaning only</small>
                </div>
                <div class="stain-option" data-level="light">
                    <i class="fas fa-tint"></i>
                    <strong>Light Stains</strong>
                    <small>Few small spots</small>
                </div>
                <div class="stain-option" data-level="moderate">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Moderate Stains</strong>
                    <small>Several noticeable stains</small>
                </div>
                <div class="stain-option" data-level="heavy">
                    <i class="fas fa-fire"></i>
                    <strong>Heavy Stains</strong>
                    <small>Extensive staining</small>
                </div>
            </div>
            <input type="hidden" id="stainLevel" value="">
        </div>

        <div class="form-group">
            <label class="form-label">Additional Services</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="stainProtection"> Stain Protection (+TZS 15,000)</label>
                <label><input type="checkbox" id="deodorizing"> Deep Deodorizing (+TZS 10,000)</label>
                <label><input type="checkbox" id="petTreatment"> Pet Stain Treatment (+TZS 20,000)</label>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Special Instructions</label>
            <textarea id="specialInstructions" class="form-control" rows="2" placeholder="Furniture to move, delicate areas, etc..."></textarea>
        </div>
    `,

    windowCleaning: `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Number of Windows <span class="required">*</span></label>
                <input type="number" id="windowCount" class="form-control" placeholder="e.g., 10" min="1" value="5">
            </div>
            <div class="form-group">
                <label class="form-label">Number of Window Panes per Window</label>
                <select id="panesPerWindow" class="form-control">
                    <option value="1">1 Pane (Single)</option>
                    <option value="2">2 Panes (Double)</option>
                    <option value="3">3+ Panes (Multiple)</option>
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Highest Floor Level</label>
                <select id="maxFloor" class="form-control">
                    <option value="1">Ground Floor (1st)</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                    <option value="5">5th+ Floor (+30% fee)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Window Type</label>
                <select id="windowType" class="form-control">
                    <option value="standard">Standard</option>
                    <option value="casement">Casement (Hinged)</option>
                    <option value="sliding">Sliding</option>
                    <option value="bay">Bay Window</option>
                    <option value="skylight">Skylight</option>
                </select>
            </div>
        </div>

        <div class="form-group full-width">
            <label class="form-label">Window Condition <span class="required">*</span></label>
            <div class="condition-grid" id="windowConditionGrid">
                <div class="condition-option" data-condition="clean">
                    <i class="fas fa-check"></i>
                    <strong>Generally Clean</strong>
                    <small>Minor dust/dirt</small>
                </div>
                <div class="condition-option" data-condition="dirty">
                    <i class="fas fa-broom"></i>
                    <strong>Dirty</strong>
                    <small>Visible grime</small>
                </div>
                <div class="condition-option" data-condition="very_dirty">
                    <i class="fas fa-fire"></i>
                    <strong>Very Dirty</strong>
                    <small>Heavy build-up</small>
                </div>
            </div>
            <input type="hidden" id="windowCondition" value="">
        </div>

        <div class="form-group">
            <label class="form-label">Accessibility Notes</label>
            <textarea id="accessNotes" class="form-control" rows="2" placeholder="Ladder access, difficult to reach windows, safety considerations..."></textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Screen Cleaning</label>
            <div class="radio-group">
                <label><input type="radio" name="screenCleaning" value="yes" checked> Yes, clean screens (+TZS 5,000)</label>
                <label><input type="radio" name="screenCleaning" value="no"> No, skip screens</label>
            </div>
        </div>
    `,

    deepCleaning: `
        <div class="form-group full-width">
            <label class="form-label">Property Type <span class="required">*</span></label>
            <div class="property-type-grid" id="propertyTypeGrid">
                <div class="property-option" data-type="apartment">
                    <i class="fas fa-building"></i>
                    <span>Apartment</span>
                </div>
                <div class="property-option" data-type="house">
                    <i class="fas fa-home"></i>
                    <span>House</span>
                </div>
                <div class="property-option" data-type="villa">
                    <i class="fas fa-swimming-pool"></i>
                    <span>Villa</span>
                </div>
                <div class="property-option" data-type="mansion">
                    <i class="fas fa-crown"></i>
                    <span>Mansion</span>
                </div>
            </div>
            <input type="hidden" id="propertyType" value="">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Total Area (sqm)</label>
                <input type="number" id="areaSqm" class="form-control" placeholder="e.g., 200" value="100">
            </div>
            <div class="form-group">
                <label class="form-label">Number of Rooms</label>
                <select id="roomCount" class="form-control">
                    <option value="1">1-2 Rooms</option>
                    <option value="2">3-4 Rooms</option>
                    <option value="3">5-6 Rooms</option>
                    <option value="4">7-8 Rooms</option>
                    <option value="5">9+ Rooms</option>
                </select>
            </div>
        </div>

        <div class="form-group full-width">
            <label class="form-label">Deep Clean Areas <span class="required">*</span></label>
            <div class="deep-clean-grid" id="deepCleanAreas">
                <div class="deep-option" data-area="kitchen">
                    <i class="fas fa-utensils"></i>
                    <span>Kitchen</span>
                    <small>Appliances, cabinets, grease removal</small>
                </div>
                <div class="deep-option" data-area="bathroom">
                    <i class="fas fa-toilet"></i>
                    <span>Bathroom</span>
                    <small>Tile grout, fixtures, mold prevention</small>
                </div>
                <div class="deep-option" data-area="bedroom">
                    <i class="fas fa-bed"></i>
                    <span>Bedroom</span>
                    <small>Closets, under beds, baseboards</small>
                </div>
                <div class="deep-option" data-area="living">
                    <i class="fas fa-couch"></i>
                    <span>Living Area</span>
                    <small>All surfaces, behind furniture</small>
                </div>
            </div>
            <input type="hidden" id="deepCleanAreasValue" value="">
        </div>

        <div class="form-group">
            <label class="form-label">Additional Deep Cleaning Services</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="ovenCleaning"> Oven Cleaning (+TZS 25,000)</label>
                <label><input type="checkbox" id="fridgeCleaning"> Refrigerator Cleaning (+TZS 20,000)</label>
                <label><input type="checkbox" id="groutCleaning"> Tile & Grout Deep Clean (+TZS 30,000)</label>
                <label><input type="checkbox" id="baseboardCleaning"> Baseboard & Trim Detail (+TZS 15,000)</label>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Special Instructions</label>
            <textarea id="specialInstructions" class="form-control" rows="3" placeholder="Areas needing extra attention, fragile items, access instructions..."></textarea>
        </div>
    `,

    constructionCleaning: `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Property Size <span class="required">*</span></label>
                <select id="propertySize" class="form-control">
                    <option value="small">Small (under 100 sqm)</option>
                    <option value="medium">Medium (100-300 sqm)</option>
                    <option value="large">Large (300-600 sqm)</option>
                    <option value="extra_large">Extra Large (600+ sqm)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Construction Type</label>
                <select id="constructionType" class="form-control">
                    <option value="renovation">Renovation</option>
                    <option value="new_build">New Build</option>
                    <option value="commercial">Commercial Construction</option>
                    <option value="partial">Partial Renovation</option>
                </select>
            </div>
        </div>

        <div class="form-group full-width">
            <label class="form-label">Debris Level <span class="required">*</span></label>
            <div class="condition-grid" id="debrisLevelGrid">
                <div class="condition-option" data-level="light">
                    <i class="fas fa-broom"></i>
                    <strong>Light</strong>
                    <small>Dust and minor debris</small>
                </div>
                <div class="condition-option" data-level="moderate">
                    <i class="fas fa-dumpster"></i>
                    <strong>Moderate</strong>
                    <small>Construction dust and debris</small>
                </div>
                <div class="condition-option" data-level="heavy">
                    <i class="fas fa-hard-hat"></i>
                    <strong>Heavy</strong>
                    <small>Extensive debris and residue</small>
                </div>
            </div>
            <input type="hidden" id="debrisLevel" value="">
        </div>

        <div class="form-group">
            <label class="form-label">Areas to Clean</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="cleanWalls"> Walls & Ceilings</label>
                <label><input type="checkbox" id="cleanFloors"> Floors</label>
                <label><input type="checkbox" id="cleanWindows"> Windows</label>
                <label><input type="checkbox" id="cleanCabinets"> Cabinets & Fixtures</label>
                <label><input type="checkbox" id="cleanHVAC"> HVAC/Vents</label>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Special Requirements</label>
            <textarea id="specialRequirements" class="form-control" rows="2" placeholder="Safety equipment needed, working hours restrictions, etc..."></textarea>
        </div>
    `,

    hotelCleaning: `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Number of Rooms <span class="required">*</span></label>
                <input type="number" id="roomCount" class="form-control" placeholder="e.g., 10" min="1" value="5">
            </div>
            <div class="form-group">
                <label class="form-label">Property Type</label>
                <select id="propertyType" class="form-control">
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="lodge">Lodge</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Room Types to Clean</label>
            <div class="checkbox-group">
                <label><input type="checkbox" id="cleanStandard"> Standard Rooms</label>
                <label><input type="checkbox" id="cleanSuite"> Suites</label>
                <label><input type="checkbox" id="cleanCommon"> Common Areas</label>
                <label><input type="checkbox" id="cleanKitchen"> Kitchen/Kitchenette</label>
                <label><input type="checkbox" id="cleanBathroom"> Bathrooms</label>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Turnover Type</label>
                <select id="turnoverType" class="form-control">
                    <option value="standard">Standard Stay-over</option>
                    <option value="deep">Deep Clean (Check-out)</option>
                    <option value="express">Express (Same-day turnover)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Linen Service</label>
                <select id="linenService" class="form-control">
                    <option value="no">No linen change needed</option>
                    <option value="basic">Basic linen change</option>
                    <option value="full">Full linen service (towels + bedding)</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Special Instructions</label>
            <textarea id="specialInstructions" class="form-control" rows="2" placeholder="Guest preferences, key access, check-out times..."></textarea>
        </div>
    `,

    // Default template for services without custom forms
    default: `
        <div class="form-group">
            <label class="form-label">Service Details</label>
            <textarea id="serviceDetails" class="form-control" rows="4" placeholder="Please describe your cleaning requirements in detail..."></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Special Instructions</label>
            <textarea id="specialInstructions" class="form-control" rows="3" placeholder="Any special requirements..."></textarea>
        </div>
    `
};

// Helper templates for remaining services
FORM_TEMPLATES.vehicleCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.poolCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.mattressCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.upholsteryCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.moveCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.laundryCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.pestControl = FORM_TEMPLATES.default;
FORM_TEMPLATES.eventCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.acCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.waterTankCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.curtainCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.gardenCleaning = FORM_TEMPLATES.default;
FORM_TEMPLATES.industrialCleaning = FORM_TEMPLATES.default;

function getFormTemplate(serviceId) {
    const config = SERVICE_CONFIGS[serviceId];
    if (config && FORM_TEMPLATES[config.formTemplate]) {
        return FORM_TEMPLATES[config.formTemplate];
    }
    return FORM_TEMPLATES.default;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - Initializing booking system');
    
    loadSelectedService();
    loadBookedDates();
    initializeNavigationButtons();
    initializeStepClickHandlers();
    initializeMap();
    attachGlobalFormListeners();
    
    // Initialize date picker after a short delay to ensure DOM is ready
    setTimeout(function() {
        initializeDatePicker();
    }, 100);
    
    updatePriceEstimate();
});

// Initialize all navigation buttons
function initializeNavigationButtons() {
    // Phase 1 to 2
    const nextPhase1Btn = document.getElementById('nextPhase1Btn');
    if (nextPhase1Btn) {
        nextPhase1Btn.addEventListener('click', function(e) {
            e.preventDefault();
            nextPhase(2);
        });
    }
    
    // Phase 2 navigation
    const prevPhase2Btn = document.getElementById('prevPhase2Btn');
    const nextPhase2Btn = document.getElementById('nextPhase2Btn');
    if (prevPhase2Btn) prevPhase2Btn.addEventListener('click', function(e) { e.preventDefault(); prevPhase(1); });
    if (nextPhase2Btn) nextPhase2Btn.addEventListener('click', function(e) { e.preventDefault(); validateAndNext(2, 3); });
    
    // Phase 3 navigation
    const prevPhase3Btn = document.getElementById('prevPhase3Btn');
    const nextPhase3Btn = document.getElementById('nextPhase3Btn');
    if (prevPhase3Btn) prevPhase3Btn.addEventListener('click', function(e) { e.preventDefault(); prevPhase(2); });
    if (nextPhase3Btn) nextPhase3Btn.addEventListener('click', function(e) { e.preventDefault(); validateAndNext(3, 4); });
    
    // Phase 4 navigation
    const prevPhase4Btn = document.getElementById('prevPhase4Btn');
    const nextPhase4Btn = document.getElementById('nextPhase4Btn');
    if (prevPhase4Btn) prevPhase4Btn.addEventListener('click', function(e) { e.preventDefault(); prevPhase(3); });
    if (nextPhase4Btn) nextPhase4Btn.addEventListener('click', function(e) { e.preventDefault(); validateAndNext(4, 5); });
    
    // Phase 5 navigation
    const prevPhase5Btn = document.getElementById('prevPhase5Btn');
    const submitBtn = document.getElementById('submitBookingBtn');
    if (prevPhase5Btn) prevPhase5Btn.addEventListener('click', function(e) { e.preventDefault(); prevPhase(4); });
    if (submitBtn) submitBtn.addEventListener('click', function(e) { e.preventDefault(); submitBooking(); });
}

// Initialize step click handlers for progress bar
function initializeStepClickHandlers() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('click', function(e) {
            const targetStep = parseInt(this.dataset.step);
            if (targetStep < currentStep) {
                // Allow going back to previous steps
                currentStep = targetStep;
                updatePhaseDisplay();
                updateProgressBar();
                if (targetStep === 5) updateReview();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (targetStep > currentStep) {
                // Validate current step before proceeding
                if (validateCurrentPhase()) {
                    currentStep = targetStep;
                    updatePhaseDisplay();
                    updateProgressBar();
                    if (targetStep === 5) updateReview();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });
}

// Load selected service and render appropriate form
function loadSelectedService() {
    const serviceData = localStorage.getItem('selectedService');
    console.log('Loading service:', serviceData);
    
    if (serviceData) {
        selectedService = JSON.parse(serviceData);
        const serviceId = selectedService.id;
        const config = SERVICE_CONFIGS[serviceId] || {
            name: selectedService.name || 'Cleaning Service',
            basePrice: 50000,
            description: 'Professional cleaning service',
            formTemplate: 'default'
        };
        
        selectedService.config = config;
        
        const banner = document.getElementById('selectedServiceBanner');
        if (banner) banner.style.display = 'flex';
        
        const serviceNameSpan = document.getElementById('selectedServiceName');
        if (serviceNameSpan) serviceNameSpan.innerText = config.name;
        
        const phase1Title = document.getElementById('phase1Title');
        if (phase1Title) phase1Title.innerText = config.name + ' Details';
        
        const phase1Desc = document.getElementById('phase1Description');
        if (phase1Desc) phase1Desc.innerHTML = config.description;
        
        const step1Label = document.getElementById('step1Label');
        if (step1Label) step1Label.innerHTML = config.name.split(' ')[0] + ' Details';
        
        // Load the service-specific form
        const formHtml = getFormTemplate(serviceId);
        const dynamicForm = document.getElementById('dynamicServiceForm');
        if (dynamicForm) {
            dynamicForm.innerHTML = formHtml;
        }
        
        // Initialize the service-specific form elements after a short delay
        setTimeout(function() {
            initializeServiceSpecificForm(serviceId);
        }, 50);
        
        // Update price estimate on any form changes
        attachServiceFormListeners(serviceId);
    } else {
        // Fallback - try to get from URL param
        const urlParams = new URLSearchParams(window.location.search);
        const serviceId = urlParams.get('service');
        if (serviceId && SERVICE_CONFIGS[serviceId]) {
            selectedService = { id: serviceId, name: SERVICE_CONFIGS[serviceId].name, config: SERVICE_CONFIGS[serviceId] };
            localStorage.setItem('selectedService', JSON.stringify(selectedService));
            loadSelectedService();
        } else {
            showToast('Please select a service first', 'error');
            setTimeout(function() { 
                window.location.href = 'service.html'; 
            }, 1500);
        }
    }
}

// Initialize service-specific form elements (grid selections, etc.)
function initializeServiceSpecificForm(serviceId) {
    const config = SERVICE_CONFIGS[serviceId];
    if (!config) return;
    
    // Initialize property type grid
    const propertyGrids = ['propertyTypeGrid', 'officeTypeGrid', 'carpetTypeGrid', 'deepCleanAreas'];
    propertyGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            const options = grid.querySelectorAll('.property-option, .office-option, .carpet-option, .deep-option');
            options.forEach(opt => {
                opt.removeEventListener('click', handleGridOptionClick);
                opt.addEventListener('click', handleGridOptionClick);
            });
        }
    });
    
    // Initialize condition/dirt/stain grids
    const conditionGrids = ['dirtLevelGrid', 'stainLevelGrid', 'debrisLevelGrid', 'windowConditionGrid'];
    conditionGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            const options = grid.querySelectorAll('.dirt-option, .stain-option, .condition-option');
            options.forEach(opt => {
                opt.removeEventListener('click', handleConditionOptionClick);
                opt.addEventListener('click', handleConditionOptionClick);
            });
        }
    });
    
    // Initialize select listeners
    const selects = ['bedrooms', 'bathrooms', 'frequency', 'cleaners', 'officeRooms', 'workstations', 
                     'carpetCount', 'carpetSize', 'windowCount', 'panesPerWindow', 'maxFloor', 'roomCount', 'areaSqm', 'propertySize'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.removeEventListener('change', updatePriceEstimate);
            select.addEventListener('change', updatePriceEstimate);
        }
    });
    
    // Initialize checkbox groups
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.removeEventListener('change', updatePriceEstimate);
        cb.addEventListener('change', updatePriceEstimate);
    });
    
    // Initialize radio groups
    const radios = document.querySelectorAll('.radio-group input[type="radio"]');
    radios.forEach(radio => {
        radio.removeEventListener('change', updatePriceEstimate);
        radio.addEventListener('change', updatePriceEstimate);
    });
}

// Handle grid option clicks
function handleGridOptionClick(e) {
    const clicked = e.currentTarget;
    const parent = clicked.parentElement;
    const siblings = parent.querySelectorAll('.property-option, .office-option, .carpet-option, .window-option, .deep-option, .construction-option, .dirt-option, .stain-option, .condition-option');
    siblings.forEach(s => s.classList.remove('selected'));
    clicked.classList.add('selected');
    
    // Find the hidden input
    const hiddenInput = parent.nextElementSibling;
    if (hiddenInput && hiddenInput.tagName === 'INPUT' && hiddenInput.type === 'hidden') {
        hiddenInput.value = clicked.dataset.type || clicked.dataset.area || clicked.dataset.level || clicked.dataset.condition;
    } else {
        // Try to find by ID
        const possibleIds = ['propertyType', 'officeType', 'carpetType', 'deepCleanAreasValue', 'dirtLevel', 'stainLevel', 'debrisLevel', 'windowCondition'];
        for (let id of possibleIds) {
            const hidden = document.getElementById(id);
            if (hidden) {
                hidden.value = clicked.dataset.type || clicked.dataset.area || clicked.dataset.level || clicked.dataset.condition;
                break;
            }
        }
    }
    updatePriceEstimate();
}

function handleConditionOptionClick(e) {
    const clicked = e.currentTarget;
    const parent = clicked.parentElement;
    const siblings = parent.querySelectorAll('.dirt-option, .stain-option, .condition-option');
    siblings.forEach(s => s.classList.remove('selected'));
    clicked.classList.add('selected');
    
    const hiddenId = parent.id === 'dirtLevelGrid' ? 'dirtLevel' : 
                    (parent.id === 'stainLevelGrid' ? 'stainLevel' :
                    (parent.id === 'debrisLevelGrid' ? 'debrisLevel' :
                    (parent.id === 'windowConditionGrid' ? 'windowCondition' : 'cleaningCondition')));
    const hiddenInput = document.getElementById(hiddenId);
    if (hiddenInput) {
        hiddenInput.value = clicked.dataset.level || clicked.dataset.condition;
    }
    updatePriceEstimate();
}

// Attach service-specific form listeners
function attachServiceFormListeners(serviceId) {
    const formContainer = document.getElementById('dynamicServiceForm');
    if (formContainer) {
        formContainer.removeEventListener('change', updatePriceEstimate);
        formContainer.removeEventListener('input', updatePriceEstimate);
        formContainer.addEventListener('change', updatePriceEstimate);
        formContainer.addEventListener('input', updatePriceEstimate);
    }
}

// Global form listeners
function attachGlobalFormListeners() {
    const allInputs = document.querySelectorAll('#phase2 input, #phase2 select, #phase2 textarea, #phase3 input, #phase3 select, #phase3 textarea, #phase4 input, #phase4 select, #phase4 textarea');
    allInputs.forEach(input => {
        input.removeEventListener('change', updateReview);
        input.removeEventListener('input', updateReview);
        input.addEventListener('change', updateReview);
        input.addEventListener('input', updateReview);
    });
}

// Price calculation functions
function calculateHomeCleaningPrice() {
    let basePrice = 50000;
    const bedrooms = parseInt(document.getElementById('bedrooms')?.value || 1);
    const bathrooms = parseInt(document.getElementById('bathrooms')?.value || 1);
    const dirtLevel = document.getElementById('dirtLevel')?.value || 'moderate';
    const cleaners = parseInt(document.getElementById('cleaners')?.value || 1);
    
    let sizeMultiplier = 0.8 + (bedrooms * 0.15) + (bathrooms * 0.05);
    sizeMultiplier = Math.min(sizeMultiplier, 2.0);
    
    let conditionMultiplier = 1;
    if (dirtLevel === 'light') conditionMultiplier = 0.8;
    else if (dirtLevel === 'moderate') conditionMultiplier = 1;
    else if (dirtLevel === 'heavy') conditionMultiplier = 1.4;
    
    let total = basePrice * sizeMultiplier * conditionMultiplier;
    total += (cleaners - 1) * 20000;
    
    return Math.round(total);
}

function calculateOfficeCleaningPrice() {
    let basePrice = 75000;
    const officeRooms = parseInt(document.getElementById('officeRooms')?.value || 1);
    const workstations = parseInt(document.getElementById('workstations')?.value || 0);
    const serviceTime = document.getElementById('serviceTime')?.value || 'business_hours';
    
    let roomMultiplier = 0.8 + (officeRooms * 0.15);
    let workstationExtra = Math.floor(workstations / 5) * 5000;
    
    let total = basePrice * roomMultiplier + workstationExtra;
    
    if (serviceTime === 'after_hours') total *= 1.2;
    else if (serviceTime === 'weekend') total *= 1.3;
    
    return Math.round(total);
}

function calculateCarpetCleaningPrice() {
    let basePrice = 60000;
    const carpetCount = parseInt(document.getElementById('carpetCount')?.value || 1);
    const carpetSize = document.getElementById('carpetSize')?.value || 'medium';
    const stainLevel = document.getElementById('stainLevel')?.value || 'none';
    
    let sizeMultiplier = 1;
    if (carpetSize === 'small') sizeMultiplier = 0.7;
    else if (carpetSize === 'medium') sizeMultiplier = 1;
    else if (carpetSize === 'large') sizeMultiplier = 1.4;
    else if (carpetSize === 'extra_large') sizeMultiplier = 1.8;
    
    let stainMultiplier = 1;
    if (stainLevel === 'light') stainMultiplier = 1.1;
    else if (stainLevel === 'moderate') stainMultiplier = 1.3;
    else if (stainLevel === 'heavy') stainMultiplier = 1.6;
    
    let total = basePrice * carpetCount * sizeMultiplier * stainMultiplier;
    
    if (document.getElementById('stainProtection')?.checked) total += 15000;
    if (document.getElementById('deodorizing')?.checked) total += 10000;
    if (document.getElementById('petTreatment')?.checked) total += 20000;
    
    return Math.round(total);
}

function calculateWindowCleaningPrice() {
    let basePrice = 40000;
    let windowCount = parseInt(document.getElementById('windowCount')?.value || 5);
    let panesPerWindow = parseInt(document.getElementById('panesPerWindow')?.value || 1);
    let maxFloor = parseInt(document.getElementById('maxFloor')?.value || 1);
    let windowCondition = document.getElementById('windowCondition')?.value || 'clean';
    let screenCleaning = document.querySelector('input[name="screenCleaning"]:checked')?.value === 'yes';
    
    let total = basePrice + (windowCount * panesPerWindow * 2000);
    
    if (maxFloor >= 5) total *= 1.3;
    else if (maxFloor >= 3) total *= 1.15;
    
    if (windowCondition === 'dirty') total *= 1.2;
    else if (windowCondition === 'very_dirty') total *= 1.4;
    
    if (screenCleaning) total += 5000;
    
    return Math.round(total);
}

function calculateDeepCleaningPrice() {
    let basePrice = 75000;
    let areaSqm = parseInt(document.getElementById('areaSqm')?.value || 100);
    let roomCount = parseInt(document.getElementById('roomCount')?.value || 2);
    
    let areaMultiplier = Math.max(0.7, Math.min(2.0, areaSqm / 100));
    let roomMultiplier = 0.8 + (roomCount * 0.15);
    
    let total = basePrice * areaMultiplier * roomMultiplier;
    
    if (document.getElementById('ovenCleaning')?.checked) total += 25000;
    if (document.getElementById('fridgeCleaning')?.checked) total += 20000;
    if (document.getElementById('groutCleaning')?.checked) total += 30000;
    if (document.getElementById('baseboardCleaning')?.checked) total += 15000;
    
    return Math.round(total);
}

function calculateConstructionCleaningPrice() {
    const propertySize = document.getElementById('propertySize')?.value || 'medium';
    const debrisLevel = document.getElementById('debrisLevel')?.value || 'moderate';
    
    let basePrice = 90000;
    let sizeMultiplier = 1;
    if (propertySize === 'small') sizeMultiplier = 0.7;
    else if (propertySize === 'medium') sizeMultiplier = 1;
    else if (propertySize === 'large') sizeMultiplier = 1.5;
    else if (propertySize === 'extra_large') sizeMultiplier = 2.2;
    
    let debrisMultiplier = 1;
    if (debrisLevel === 'light') debrisMultiplier = 0.8;
    else if (debrisLevel === 'moderate') debrisMultiplier = 1;
    else if (debrisLevel === 'heavy') debrisMultiplier = 1.4;
    
    return Math.round(basePrice * sizeMultiplier * debrisMultiplier);
}

function calculateHotelCleaningPrice() {
    const roomCount = parseInt(document.getElementById('roomCount')?.value || 5);
    const turnoverType = document.getElementById('turnoverType')?.value || 'standard';
    const linenService = document.getElementById('linenService')?.value || 'no';
    
    let basePrice = 50000;
    let pricePerRoom = 15000;
    let total = basePrice + (roomCount * pricePerRoom);
    
    if (turnoverType === 'deep') total *= 1.5;
    else if (turnoverType === 'express') total *= 1.3;
    
    if (linenService === 'basic') total += roomCount * 5000;
    else if (linenService === 'full') total += roomCount * 10000;
    
    return Math.round(total);
}

// Simple price functions for other services
function calculateVehicleCleaningPrice() { return 45000; }
function calculatePoolCleaningPrice() { return 80000; }
function calculateMattressCleaningPrice() { return 55000; }
function calculateUpholsteryCleaningPrice() { return 65000; }
function calculateMoveCleaningPrice() { return 70000; }
function calculateLaundryCleaningPrice() { return 54000; }
function calculatePestControlPrice() { return 54000; }
function calculateEventCleaningPrice() { return 90000; }
function calculateAcCleaningPrice() { return 45000; }
function calculateWaterTankCleaningPrice() { return 70000; }
function calculateCurtainCleaningPrice() { return 40000; }
function calculateGardenCleaningPrice() { return 55000; }
function calculateIndustrialCleaningPrice() { return 120000; }

// Main price estimate update function
function updatePriceEstimate() {
    if (!selectedService || !selectedService.config) {
        const totalSpan = document.getElementById('totalPrice');
        if (totalSpan) totalSpan.innerText = 'TZS 0';
        return 0;
    }
    
    const config = selectedService.config;
    let total = 0;
    
    if (config.getPrice) {
        total = config.getPrice();
    } else {
        total = config.basePrice || 50000;
        const frequency = document.getElementById('frequency')?.value;
        if (frequency === 'weekly') total *= 0.9;
        else if (frequency === 'biweekly') total *= 0.85;
        else if (frequency === 'monthly') total *= 0.8;
    }
    
    // Update display elements
    const basePriceSpan = document.getElementById('basePrice');
    const totalPriceSpan = document.getElementById('totalPrice');
    const estimatedPriceSpan = document.getElementById('estimatedPrice');
    const estimatedHoursSpan = document.getElementById('estimatedHours');
    
    if (basePriceSpan) basePriceSpan.innerText = `TZS ${(config.basePrice || 50000).toLocaleString()}`;
    if (totalPriceSpan) totalPriceSpan.innerText = `TZS ${total.toLocaleString()}`;
    if (estimatedPriceSpan) estimatedPriceSpan.innerText = `TZS ${total.toLocaleString()}`;
    if (estimatedHoursSpan) estimatedHoursSpan.innerText = config.duration || '2-3 hours';
    
    const sizeAdjustment = document.getElementById('sizeAdjustment');
    const conditionAdjustment = document.getElementById('conditionAdjustment');
    const extrasAdjustment = document.getElementById('extrasAdjustment');
    
    if (sizeAdjustment) sizeAdjustment.innerText = `TZS ${Math.round(total * 0.1).toLocaleString()}`;
    if (conditionAdjustment) conditionAdjustment.innerText = `TZS ${Math.round(total * 0.15).toLocaleString()}`;
    if (extrasAdjustment) extrasAdjustment.innerText = 'TZS 0';
    
    return total;
}

// Validation functions
function validateHomeCleaning() {
    const propertyType = document.getElementById('propertyType')?.value;
    const dirtLevel = document.getElementById('dirtLevel')?.value;
    
    if (!propertyType) {
        showToast('Please select a property type', 'error');
        return false;
    }
    if (!dirtLevel) {
        showToast('Please select the dirt level', 'error');
        return false;
    }
    return true;
}

function validateOfficeCleaning() {
    const officeType = document.getElementById('officeType')?.value;
    if (!officeType) {
        showToast('Please select an office type', 'error');
        return false;
    }
    return true;
}

function validateCarpetCleaning() {
    const carpetType = document.getElementById('carpetType')?.value;
    const stainLevel = document.getElementById('stainLevel')?.value;
    
    if (!carpetType) {
        showToast('Please select the carpet type', 'error');
        return false;
    }
    if (!stainLevel) {
        showToast('Please select the stain level', 'error');
        return false;
    }
    return true;
}

function validateWindowCleaning() {
    const windowCount = document.getElementById('windowCount')?.value;
    const windowCondition = document.getElementById('windowCondition')?.value;
    
    if (!windowCount || windowCount < 1) {
        showToast('Please enter the number of windows', 'error');
        return false;
    }
    if (!windowCondition) {
        showToast('Please select the window condition', 'error');
        return false;
    }
    return true;
}

function validateDeepCleaning() {
    const propertyType = document.getElementById('propertyType')?.value;
    if (!propertyType) {
        showToast('Please select a property type', 'error');
        return false;
    }
    return true;
}

function validateConstructionCleaning() {
    const debrisLevel = document.getElementById('debrisLevel')?.value;
    if (!debrisLevel) {
        showToast('Please select the debris level', 'error');
        return false;
    }
    return true;
}

function validateHotelCleaning() {
    const roomCount = document.getElementById('roomCount')?.value;
    if (!roomCount || roomCount < 1) {
        showToast('Please enter the number of rooms', 'error');
        return false;
    }
    return true;
}

function validateVehicleCleaning() { return true; }
function validatePoolCleaning() { return true; }
function validateMattressCleaning() { return true; }
function validateUpholsteryCleaning() { return true; }
function validateMoveCleaning() { return true; }
function validateLaundryCleaning() { return true; }
function validatePestControl() { return true; }
function validateEventCleaning() { return true; }
function validateAcCleaning() { return true; }
function validateWaterTankCleaning() { return true; }
function validateCurtainCleaning() { return true; }
function validateGardenCleaning() { return true; }
function validateIndustrialCleaning() { return true; }

// Validate current phase
function validateCurrentPhase() {
    switch(currentStep) {
        case 1:
            if (selectedService && selectedService.config && selectedService.config.validation) {
                return selectedService.config.validation();
            }
            // For services without custom validation, check if any required fields exist
            const requiredFields = document.querySelectorAll('#dynamicServiceForm .required');
            if (requiredFields.length > 0) {
                let allValid = true;
                requiredFields.forEach(field => {
                    const parent = field.closest('.form-group');
                    if (parent) {
                        const select = parent.querySelector('select');
                        const input = parent.querySelector('input:not([type="hidden"])');
                        const textarea = parent.querySelector('textarea');
                        const grid = parent.querySelector('[class*="-grid"]');
                        
                        if (select && !select.value) allValid = false;
                        if (input && !input.value) allValid = false;
                        if (textarea && !textarea.value) allValid = false;
                        if (grid) {
                            const selected = grid.querySelector('.selected');
                            if (!selected) allValid = false;
                        }
                    }
                });
                if (!allValid) {
                    showToast('Please fill in all required fields', 'error');
                    return false;
                }
            }
            return true;
            
        case 2:
            const date = document.getElementById('preferredDate').value;
            const time = document.getElementById('preferredTime').value;
            
            if (!date) {
                showToast('Please select a preferred date', 'error');
                return false;
            }
            if (!time) {
                showToast('Please select a preferred time', 'error');
                return false;
            }
            
            const key = `${date}_${time}`;
            if (bookedDates[key] >= 3) {
                showToast('This time slot is fully booked. Please select another time.', 'error');
                return false;
            }
            return true;
            
        case 3:
            const firstName = document.getElementById('firstName')?.value.trim();
            const lastName = document.getElementById('lastName')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            
            if (!firstName) { showToast('Please enter your first name', 'error'); return false; }
            if (!lastName) { showToast('Please enter your last name', 'error'); return false; }
            if (!email) { showToast('Please enter your email address', 'error'); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email address', 'error'); return false; }
            if (!phone) { showToast('Please enter your phone number', 'error'); return false; }
            return true;
            
        case 4:
            const street = document.getElementById('streetAddress')?.value.trim();
            const area = document.getElementById('area')?.value.trim();
            const city = document.getElementById('city')?.value.trim();
            const lat = document.getElementById('latitude')?.value;
            const lng = document.getElementById('longitude')?.value;
            
            if (!street) { showToast('Please enter your street address', 'error'); return false; }
            if (!area) { showToast('Please enter your area/district', 'error'); return false; }
            if (!city) { showToast('Please enter your city', 'error'); return false; }
            if (!lat || !lng) { showToast('Please pin your location on the map', 'error'); return false; }
            return true;
            
        default:
            return true;
    }
}

// Navigation functions
function nextPhase(step) {
    if (validateCurrentPhase()) {
        currentStep = step;
        updatePhaseDisplay();
        updateProgressBar();
        
        if (step === 4 && mapInstance) {
            setTimeout(function() { mapInstance.invalidateSize(); }, 100);
        }
        
        if (step === 5) {
            updateReview();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevPhase(step) {
    currentStep = step;
    updatePhaseDisplay();
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAndNext(current, next) {
    const tempStep = currentStep;
    currentStep = current;
    if (validateCurrentPhase()) {
        currentStep = next;
        updatePhaseDisplay();
        updateProgressBar();
        if (next === 5) updateReview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        currentStep = tempStep;
    }
}

function updatePhaseDisplay() {
    for (let i = 1; i <= 5; i++) {
        const phase = document.getElementById(`phase${i}`);
        const step = document.querySelector(`.step[data-step="${i}"]`);
        if (phase) {
            if (i === currentStep) {
                phase.classList.add('active');
                if (step) step.classList.add('active');
            } else {
                phase.classList.remove('active');
                if (step) step.classList.remove('active');
                if (i < currentStep && step) step.classList.add('completed');
                else if (step) step.classList.remove('completed');
            }
        }
    }
}

function updateProgressBar() {
    const fillPercent = ((currentStep - 1) / 4) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${fillPercent}%`;
}

// Load booked dates
function loadBookedDates() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    bookings.forEach(booking => {
        if (booking.scheduleDate && booking.status !== 'cancelled') {
            const bookingDate = new Date(booking.scheduleDate);
            if (bookingDate >= today) {
                const key = `${booking.scheduleDate}_${booking.scheduleTime}`;
                if (!bookedDates[key]) bookedDates[key] = 0;
                bookedDates[key]++;
            }
        }
    });
}

// Initialize date picker - FIXED
function initializeDatePicker() {
    const dateInput = document.getElementById('preferredDate');
    if (!dateInput) {
        console.error('Date picker element not found');
        return;
    }
    
    // Destroy existing instance if any
    if (flatpickrInstance) {
        flatpickrInstance.destroy();
    }
    
    flatpickrInstance = flatpickr(dateInput, {
        minDate: "today",
        dateFormat: "Y-m-d",
        allowInput: false,
        disable: [
            function(date) {
                const dateStr = flatpickr.formatDate(date, "Y-m-d");
                let totalBookings = 0;
                for (let key in bookedDates) {
                    if (key.startsWith(dateStr)) {
                        totalBookings += bookedDates[key];
                    }
                }
                return totalBookings >= 5;
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            if (dateStr) {
                updateTimeSlotAvailability(dateStr);
                // Clear any validation message
                const validationDiv = document.getElementById('dateValidation');
                if (validationDiv) validationDiv.innerHTML = '';
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            // Force the calendar to be interactive
            instance.calendarContainer.style.pointerEvents = 'auto';
        }
    });
    
    // Also allow clicking on the input to open calendar
    dateInput.addEventListener('click', function(e) {
        if (flatpickrInstance) {
            flatpickrInstance.open();
        }
    });
}

function updateTimeSlotAvailability(dateStr) {
    const timeSelect = document.getElementById('preferredTime');
    if (!timeSelect) return;
    
    const slots = timeSelect.querySelectorAll('option');
    slots.forEach(slot => {
        if (slot.value) {
            const key = `${dateStr}_${slot.value}`;
            const bookingCount = bookedDates[key] || 0;
            if (bookingCount >= 3) {
                slot.disabled = true;
                slot.textContent = slot.textContent.replace(/\s*\(.*\)/, '') + ' (Fully Booked)';
            } else if (bookingCount >= 2) {
                slot.disabled = false;
                slot.textContent = slot.textContent.replace(/\s*\(.*\)/, '') + ' (Limited Availability)';
            } else {
                slot.disabled = false;
                slot.textContent = slot.textContent.replace(/\s*\(.*\)/, '');
            }
        }
    });
}

// Initialize map
function initializeMap() {
    const mapContainer = document.getElementById('locationMap');
    if (!mapContainer) {
        console.log('Map container not found yet, will initialize later');
        return;
    }
    
    const defaultLat = -6.1659;
    const defaultLng = 39.2026;
    
    mapInstance = L.map('locationMap').setView([defaultLat, defaultLng], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    mapInstance.on('click', function(e) {
        placeMarker(e.latlng.lat, e.latlng.lng);
    });
    
    // Try to get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                mapInstance.setView([userLat, userLng], 15);
                placeMarker(userLat, userLng);
            },
            function(error) {
                console.log('Geolocation error:', error.message);
            }
        );
    }
}

function placeMarker(lat, lng) {
    if (currentMarker) {
        mapInstance.removeLayer(currentMarker);
    }
    
    const customIcon = L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #4361ee, #764ba2); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"><i class="fas fa-map-pin" style="color: white; font-size: 14px;"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    
    currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
    currentMarker.bindPopup('📍 Your selected location').openPopup();
    
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    
    const coordsDisplay = document.getElementById('coordsDisplay');
    const coordsInfo = document.getElementById('coordinatesInfo');
    if (coordsDisplay) coordsDisplay.innerText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (coordsInfo) coordsInfo.style.display = 'flex';
    
    reverseGeocode(lat, lng);
}

function reverseGeocode(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                const road = data.address.road || data.address.path || '';
                const houseNumber = data.address.house_number || '';
                const suburb = data.address.suburb || data.address.village || '';
                const city = data.address.city || data.address.town || data.address.county || '';
                
                const streetAddress = document.getElementById('streetAddress');
                const areaInput = document.getElementById('area');
                const cityInput = document.getElementById('city');
                
                if (streetAddress && !streetAddress.value) {
                    streetAddress.value = (houseNumber ? houseNumber + ', ' : '') + road;
                }
                if (areaInput && !areaInput.value && suburb) {
                    areaInput.value = suburb;
                }
                if (cityInput && !cityInput.value && city) {
                    cityInput.value = city;
                }
            }
        })
        .catch(err => console.log('Reverse geocoding failed:', err));
}

// Update review section
function updateReview() {
    const reviewContainer = document.getElementById('reviewContent');
    if (!reviewContainer) return;
    
    let serviceDetailsHtml = '';
    const phase1Inputs = document.querySelectorAll('#dynamicServiceForm input, #dynamicServiceForm select, #dynamicServiceForm textarea');
    phase1Inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                const label = input.parentElement.innerText;
                serviceDetailsHtml += `<div class="review-item"><span class="review-label">${label.split('(')[0]}:</span><span class="review-value">Yes</span></div>`;
            }
        } else if (input.type === 'radio') {
            if (input.checked) {
                const label = input.parentElement.innerText;
                serviceDetailsHtml += `<div class="review-item"><span class="review-label">${label.split('(')[0]}:</span><span class="review-value">${input.value === 'yes' ? 'Yes' : 'No'}</span></div>`;
            }
        } else if (input.value && input.id) {
            const label = input.previousElementSibling?.innerText || input.placeholder || input.id;
            let displayValue = input.value;
            if (input.tagName === 'SELECT' && input.options[input.selectedIndex]) {
                displayValue = input.options[input.selectedIndex].text;
            }
            if (displayValue && !input.id.includes('Instructions') && displayValue !== '') {
                serviceDetailsHtml += `<div class="review-item"><span class="review-label">${label.replace('*', '').trim()}:</span><span class="review-value">${displayValue}</span></div>`;
            }
        }
    });
    
    const total = updatePriceEstimate();
    const serviceName = selectedService?.config?.name || selectedService?.name || 'Service';
    
    reviewContainer.innerHTML = `
        <h4><i class="fas fa-clipboard-list"></i> ${serviceName} Details</h4>
        ${serviceDetailsHtml || '<div class="review-item"><span class="review-label">No additional details</span><span class="review-value">-</span></div>'}
        
        <h4 class="mt-3"><i class="fas fa-calendar"></i> Schedule</h4>
        <div class="review-item"><span class="review-label">Preferred Date:</span><span class="review-value">${document.getElementById('preferredDate')?.value || 'Not selected'}</span></div>
        <div class="review-item"><span class="review-label">Preferred Time:</span><span class="review-value">${document.getElementById('preferredTime')?.options[document.getElementById('preferredTime')?.selectedIndex]?.text || 'Not selected'}</span></div>
        
        <h4 class="mt-3"><i class="fas fa-user"></i> Customer Details</h4>
        <div class="review-item"><span class="review-label">Full Name:</span><span class="review-value">${document.getElementById('firstName')?.value || ''} ${document.getElementById('lastName')?.value || ''}</span></div>
        <div class="review-item"><span class="review-label">Email:</span><span class="review-value">${document.getElementById('email')?.value || ''}</span></div>
        <div class="review-item"><span class="review-label">Phone:</span><span class="review-value">${document.getElementById('phone')?.value || ''}</span></div>
        
        <h4 class="mt-3"><i class="fas fa-map-marker-alt"></i> Location</h4>
        <div class="review-item"><span class="review-label">Address:</span><span class="review-value">${document.getElementById('streetAddress')?.value || ''}, ${document.getElementById('area')?.value || ''}, ${document.getElementById('city')?.value || ''}</span></div>
        
        <div class="review-item total mt-3"><span class="review-label">Estimated Total:</span><span class="review-value" style="color: var(--primary); font-weight: 800;">TZS ${total.toLocaleString()}</span></div>
        <p class="text-muted small mt-2"><i class="fas fa-info-circle"></i> Final invoice will be sent after admin review</p>
    `;
}

// Submit booking
function submitBooking() {
    if (!validateCurrentPhase()) return;
    
    const serviceDetails = {};
    const phase1Inputs = document.querySelectorAll('#dynamicServiceForm input, #dynamicServiceForm select, #dynamicServiceForm textarea');
    phase1Inputs.forEach(input => {
        if (input.type === 'checkbox') {
            serviceDetails[input.id] = input.checked;
        } else if (input.type === 'radio' && input.checked) {
            serviceDetails[input.name] = input.value;
        } else if (input.value && input.id) {
            serviceDetails[input.id] = input.value;
        }
    });
    
    const bookingData = {
        bookingId: 'BK' + Date.now() + Math.floor(Math.random() * 1000),
        serviceId: selectedService?.id || 'unknown',
        serviceName: selectedService?.config?.name || selectedService?.name || 'Cleaning Service',
        serviceCategory: selectedService?.config?.category || 'general',
        serviceDetails: serviceDetails,
        scheduleDate: document.getElementById('preferredDate')?.value || '',
        scheduleTime: document.getElementById('preferredTime')?.value || '',
        scheduleInstructions: document.getElementById('scheduleInstructions')?.value || '',
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        altPhone: document.getElementById('altPhone')?.value || '',
        preferredCommunication: document.getElementById('prefComm')?.value || 'email',
        streetAddress: document.getElementById('streetAddress')?.value || '',
        area: document.getElementById('area')?.value || '',
        city: document.getElementById('city')?.value || '',
        region: document.getElementById('region')?.value || '',
        landmark: document.getElementById('landmark')?.value || '',
        buildingName: document.getElementById('buildingName')?.value || '',
        floorNumber: document.getElementById('floorNumber')?.value || '',
        latitude: document.getElementById('latitude')?.value || '',
        longitude: document.getElementById('longitude')?.value || '',
        estimatedTotal: updatePriceEstimate(),
        paymentStatus: 'pending',
        bookingStatus: 'pending_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.removeItem('selectedService');
    
    const bookingIdDisplay = document.getElementById('bookingIdDisplay');
    if (bookingIdDisplay) bookingIdDisplay.innerText = `Booking ID: ${bookingData.bookingId}`;
    
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}

// Toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

// Add toast styles if not already present
if (!document.querySelector('#toastStyles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toastStyles';
    toastStyles.textContent = `
        .custom-toast {
            background: var(--bg-white);
            border-left: 4px solid;
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            min-width: 280px;
        }
        .custom-toast.toast-error { border-left-color: #ef4444; }
        .custom-toast.toast-error i { color: #ef4444; }
        .custom-toast i:first-child { font-size: 1.2rem; }
        .custom-toast span { flex: 1; font-size: 0.9rem; }
        .custom-toast button {
            background: none;
            border: none;
            cursor: pointer;
            color: #94a3b8;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(toastStyles);
}