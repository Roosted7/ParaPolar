
# **Technical Specification: Interactive Paraglider Polar Curve Visualization**

## **Part I: Core Concept & Visualization Canvas**

### **Objective**

This section provides the foundational specifications for the primary visual environment of the application. The instructions herein will guide the programmer in constructing the main 2D visualization canvas, defining its coordinate system, axes, and key graphical elements. It also specifies a secondary, consequential visualization to illustrate the practical results of flight dynamics over the ground. The combination of these two views is designed to deliver a comprehensive educational experience, separating the theoretical aerodynamics from their real-world impact.

### **1.1 The Polar Coordinate System**

The central element of the application will be a 2D Cartesian graph, which serves as the canvas for plotting the paraglider's polar curve. This graph represents the relationship between the glider's horizontal speed through the air and its vertical speed (sink rate).1

#### **1.1.1 Horizontal Axis (X-axis)**

The horizontal axis represents the glider's **Airspeed** (Vx​). This is the speed of the paraglider relative to the surrounding airmass, not its speed over the ground.2

* **Labeling:** The axis must be clearly labeled "Airspeed."  
* **Units:** The axis should display values in both kilometers per hour (km/h) and meters per second (m/s). The user must be able to select their preferred primary unit for display, with the secondary unit shown parenthetically or via a toggle. The default unit should be km/h, as this is the most common standard in paragliding.3  
* **Scale:** The scale should dynamically adjust to accommodate the full speed range of the highest-performance glider available in the simulation (e.g., 0 to 70 km/h).

#### **1.1.2 Vertical Axis (Y-axis)**

The vertical axis represents the glider's **Sink Rate** (Vz​). This is the vertical speed at which the glider descends through a still airmass.1

* **Labeling:** The axis must be clearly labeled "Sink Rate."  
* **Units:** The axis will be exclusively labeled in meters per second (m/s), which is the standard convention for variometer readings in the sport.3  
* **Direction:** By aerodynamic convention, sink is a negative velocity. Therefore, the axis origin (zero) will be at the top, with values increasing downwards (e.g., \-1.0 m/s, \-2.0 m/s).5

#### **1.1.3 Graph Origin**

The origin of the graph, at coordinate (0,0), represents a state of zero airspeed and zero sink rate. This is a crucial theoretical reference point for calculating the best glide angle.1

### **1.2 Plotting the Polar Curve**

The polar curve is a continuous, parabolic-like line plotted on this coordinate system. It represents the complete set of all possible steady-state flight configurations for a specific paraglider, from its stall speed to its maximum accelerated speed.6 The programmer will be provided with a set of key data points for each glider model (detailed in Part III). A function must be implemented to render a smooth curve that passes through these key points, likely using a quadratic or cubic spline interpolation. The curve should be visually distinct and professionally rendered.

### **1.3 Visual Identification of Key Performance Points**

To maximize the educational value for pilots, several critical points along the polar curve must be clearly and dynamically identified. These points should be marked with distinct icons or dots on the curve. On mouse hover or touch tap, a tooltip must appear, displaying the name of the point and its precise airspeed and sink rate values. These points are fundamental to understanding paraglider performance.3

* **Stall Point:** This is the leftmost terminal point of the curve. It represents the minimum airspeed the glider can maintain before an aerodynamic stall occurs, where the wing loses its lift-generating capabilities.5  
* **Minimum Sink (Vzmin​​):** This is the highest point on the curve, corresponding to the lowest (least negative) sink rate. Flying at this speed maximizes the time the pilot can stay airborne in neutral air.1 This point is geometrically defined as the point of tangency for a horizontal line that touches the top of the polar curve. This tangent line should be visually rendered as a faint, dashed line when this point is highlighted.  
* **Best Glide (Finesse Max):** This point represents the optimal glide ratio (Lift/Drag or L/D), where the glider covers the maximum horizontal distance for a given loss of altitude in still air.1 Geometrically, this point is identified by drawing a straight line from the graph's origin (0,0) that is tangent to the polar curve.9 The point of tangency marks the airspeed for best glide. This tangent line, representing the best possible glide angle, should be rendered as a key visual element.  
* **Trim Speed:** This is the glider's natural, hands-off flying speed, with no brake or speedbar input applied. It is a crucial reference point for pilots and must be clearly marked on the curve.3 For many gliders, this speed is very close to the best glide speed.4  
* **Max Speed:** This is the rightmost terminal point of the curve, representing the maximum airspeed achievable with the full application of the speed system (speedbar).5

### **1.4 The Ground Reference Visualization**

To translate the abstract polar graph into a tangible outcome, a secondary visualization is required. This view will be positioned below the main polar graph and will depict the glider's actual flight path over the ground. This provides immediate, intuitive feedback on how control and environmental inputs affect real-world performance. This dual-visualization approach is fundamental to the tool's purpose, as it separates the physics relative to the airmass (the polar) from the resulting trajectory over the ground (the consequence).

* **Layout:** A simple 2D side-scrolling view representing a cross-section of terrain (e.g., hills and a valley).  
* **Glider Icon:** A small icon representing a paraglider will traverse this view from left to right.  
* **Flight Path:** The angle of the glider's flight path in this view will not be based on the airspeed polar curve directly. Instead, it will be determined by the **effective glide ratio over ground**, which is calculated in real-time by the physics engine (detailed in Part II). This visual distinction is critical for teaching pilots how wind and airmass movement alter their actual performance.

## **Part II: Physics Engine & Interactive Dynamics**

### **Objective**

This section details the core algorithms and computational logic required to power the interactive simulation. It provides the programmer with a clear model for how user inputs (pilot controls) and environmental variables (wind, airmass movement) dynamically alter the state of the visualization. The central mechanism is a well-established geometric transformation of the polar curve and its reference points, which accurately models the "speed to fly" theory used by pilots.

### **2.1 Pilot Control Simulation**

The user's primary interaction with the glider's performance is through a single, intuitive control. This control simulates the pilot's use of brakes and the speedbar system.

* **Control Element:** A single slider will be implemented. The slider's range will represent the full spectrum of pilot control inputs.  
* **Mapping:**  
  * **Full Brakes:** One end of the slider corresponds to maximum brake application, moving the active point on the polar curve to the **Stall Point**.  
  * **Trim Speed:** The center position of the slider represents "hands up" flight, with no control input. This places the active point on the **Trim Speed** mark of the curve.  
  * **Full Speedbar:** The other end of the slider corresponds to maximum speedbar application, moving the active point to the **Max Speed** point on the curve.  
* **Visual Feedback:** As the user adjusts the slider, a prominent indicator (e.g., a colored dot or a small glider icon) must travel smoothly along the rendered polar curve. The data displays in the "Advanced Mode" will update in real-time to reflect the airspeed and sink rate of the indicator's current position.

### **2.2 Environmental Dynamics: The Shifting Origin Algorithm**

The most critical function of this tool is to demonstrate the effects of wind and moving airmasses (lift/sink) on glider performance. This is achieved not by altering the glider's intrinsic polar curve (which is fixed relative to the air it flies through), but by geometrically shifting the reference frame from which performance is measured.1 This method correctly visualizes why pilots must adjust their "speed to fly" in different conditions.

#### **2.2.1 Headwind and Tailwind (Horizontal Shift)**

Wind that is parallel to the glider's direction of flight directly impacts its speed over the ground and, consequently, its effective glide ratio.

* **Input:** A slider will allow the user to set the wind speed. A headwind will be represented as a positive value, and a tailwind as a negative value.  
* **Algorithm:** The origin point for the **Best Glide** tangent line calculation is shifted horizontally along the x-axis by the magnitude of the wind speed.  
  * For a headwind of speed W, the new origin for the tangent calculation becomes (W,0).  
  * For a tailwind of speed W, the new origin becomes (−W,0).  
* **Implementation:** The programmer must implement a function that dynamically recalculates and redraws the tangent line from this new, shifted origin to the static polar curve. The point of tangency on the curve will update in real-time.  
* **Visual Outcome:** The user will observe that with a headwind, the "Best Glide" point moves to the right on the polar curve, indicating that a higher airspeed is required to achieve the maximum distance over the ground. Conversely, with a tailwind, the optimal speed moves left, closer to the minimum sink speed.1 This visual feedback is the core of teaching speed-to-fly principles.

#### **2.2.2 Lift and Sink (Vertical Shift)**

Vertical airmass movement (thermals or sinking air) directly adds to or subtracts from the glider's own sink rate.

* **Input:** A slider will allow the user to set the vertical airmass velocity. Lift (e.g., in a thermal) will be a positive value, and sink will be a negative value.  
* **Algorithm:** The **entire polar curve** is shifted vertically on the graph.  
  * For an airmass sinking at a rate of S, the entire curve is displaced downwards by the value of S.  
  * For an airmass rising (lift) at a rate of L, the entire curve is displaced upwards by the value of L.  
* **Implementation:** The function for drawing the polar curve must accept a vertical offset parameter. The tangent calculation for best glide is then performed on this newly positioned, shifted curve (from the potentially also-shifted wind origin).  
* **Visual Outcome:** The user will see the entire performance envelope of the glider improve in lift and degrade in sink. This demonstrates why it is crucial to fly faster when encountering sinking air to minimize the time spent within it and thus maximize the distance covered.1

### **2.3 Calculating the Resultant Flight Path**

The physics engine must continuously compute the glider's actual trajectory over the ground based on pilot inputs and environmental conditions. These calculations will drive the animation in the ground reference visualization.

At any given moment, the simulation state includes:

1. The pilot's selected point on the intrinsic polar curve: (Vxair​​, Vzair​​).  
2. The environmental conditions: (Vwind​, Vlift/sink​).

The following resultant values must be calculated:

* Groundspeed (Vxground​​): This is the glider's horizontal speed relative to the ground.

  Vxground​​=Vxair​​−Vwind​

  (Note: Use consistent units. By convention, a headwind is a positive Vwind​).  
* Vertical Speed over Ground (Vzground​​): This is the glider's vertical speed relative to the ground.

  Vzground​​=Vzair​​−Vlift/sink​

  (Note: A positive Vlift/sink​ represents lift, which reduces the total sink rate).  
* Effective Glide Ratio over Ground (GRground​): This is the final performance metric that determines the flight path angle.

  GRground​=−Vzground​​Vxground​​​

  (Note: The negative sign on Vzground​​ is to yield a positive glide ratio, as sink rate Vz​ is negative).

This calculated GRground​ value is then passed to the ground reference visualization module to set the angle of the glider's animated flight path.

## **Part III: Paraglider Performance Models & Data**

### **Objective**

This section provides the programmer with the specific, curated performance data required to accurately model the different classes of paragliders requested by the user. It establishes a set of archetypal performance profiles that serve as the foundation for the entire simulation.

### **3.1 A Note on Data Accuracy and Methodology**

It is imperative to preface this data with a technical disclaimer. Unlike rigid-wing aircraft, official, manufacturer-certified polar curve data for paragliders is exceptionally rare and not typically published for public use.11 There are several valid reasons for this industry practice:

1. **Harness and Pilot Drag:** A significant portion of the total aerodynamic drag comes from the pilot and their harness. A pilot in a sleek, aerodynamic pod harness will achieve a measurably better glide ratio than the same pilot in an upright, open harness. This variable alone can alter the glide ratio by a full point or more.14  
2. **Wing Loading:** A paraglider's performance is highly dependent on its "wing loading"—the total in-flight weight divided by the wing's surface area. A glider flown at the top of its certified weight range will fly faster than the same glider flown at the bottom of its range.6  
3. **Atmospheric Conditions:** Air density, which varies with altitude and temperature, directly affects airspeed and performance calculations.16  
4. **Measurement Challenges:** Accurately measuring a polar curve in flight requires perfectly calm, homogenous air, a condition that is virtually non-existent in the real atmosphere. Even minute, imperceptible air movements can skew results significantly.12

Therefore, the data presented in this section should not be interpreted as absolute, certified values for any specific model. Instead, it represents a set of well-researched **archetypes**. These archetypes are synthesized from reputable third-party sources, flight reviews, and published typical performance figures, providing a realistic and educationally valuable comparison between the different classes of wings.4 This approach ensures the simulation is grounded in realistic performance differences, which is the primary goal of the tool.

### **3.2 Glider Category Descriptions**

To provide context for the user, brief descriptions of each selectable glider category will be available within the UI.

* **Single-Skin:** These are ultralight wings designed primarily for hike & fly, where minimal weight and pack volume are paramount. They feature a single top surface with no bottom sail. This design results in exceptionally easy inflation characteristics and very low canopy inertia, making them forgiving in turbulence. However, their aerodynamic profile is less efficient, leading to a lower overall glide ratio, particularly when accelerated.15  
* **EN-A (Beginner):** Certified for maximum passive safety, these wings are designed to be extremely forgiving of pilot error. They have a natural tendency to recover from collapses without pilot input. Their performance is modest, prioritizing stability and ease of use for training and a pilot's first flights.19  
* **EN-B (Intermediate):** This is the broadest and most popular category, representing a balance between performance and passive safety. It is often subdivided:  
  * **Low EN-B ("Progression"):** Suitable for pilots graduating from school, offering a gentle step up in performance while retaining high levels of security.22  
  * **High EN-B ("XC"):** Aimed at intermediate cross-country pilots, these wings have higher aspect ratios and offer significantly more performance and feedback, requiring more active piloting skills.24  
* **EN-C (Performance):** Designed for experienced and current cross-country pilots. These wings feature higher aspect ratios, more cells, and thinner profiles. They demand active piloting and precise control but reward the pilot with excellent glide performance, especially on speedbar, and a higher top speed.4  
* **Tandem:** These are large, robust wings certified to carry the weight of a pilot and a passenger. Their design prioritizes maximum stability, easy launch and landing characteristics, and a very wide weight range. Performance is comparable to an EN-B wing, but they are engineered for exceptional pitch and roll stability.19

### **3.3 Polar Curve Data Table**

The following table provides the key performance points for the programmer to construct the polar curve for each glider archetype. The application should use these points to fit a smooth curve (e.g., using a polynomial or spline function) for the visualization.

| Glider Class | Min Sink Speed (km/h) | Min Sink Rate (m/s) | Trim Speed (km/h) | Trim Sink Rate (m/s) | Max Speed (km/h) | Max Speed Sink Rate (m/s) | Best Glide (L/D) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Single-Skin | 25 | \-1.20 | 38 | \-1.50 | 45 | \-3.00 | 7.0 |
| EN-A (Beginner) | 26 | \-1.10 | 35 | \-1.20 | 45 | \-2.20 | 8.5 |
| EN-B (Progression) | 28 | \-1.05 | 36 | \-1.11 | 48 | \-1.90 | 9.0 |
| EN-B+ (XC) | 29 | \-1.00 | 36 | \-1.05 | 50 | \-1.85 | 9.5 |
| EN-C (Performance) | 30 | \-0.98 | 37 | \-1.03 | 53 | \-1.84 | 10.0 |
| Tandem | 30 | \-1.00 | 40 | \-1.25 | 52 | \-2.10 | 9.0 |

Data synthesized from sources:.4

## **Part IV: User Interface (UI) & User Experience (UX) Specification**

### **Objective**

This section defines the visual layout, interactive controls, and overall user experience design for the website. The specification ensures the application is intuitive, accessible on all devices, and effectively implements the requested dual-mode interface for both beginner and advanced users.

### **4.1 General Layout & Responsiveness**

The application must be fully responsive, providing an optimal experience on both desktop and mobile devices. A fluid layout is required, adapting gracefully to different screen sizes.

* **Desktop Layout (screens wider than \~1024px):** A two-panel layout is recommended for efficient use of screen real estate.  
  * **Left Panel (approx. 35-40% width):** This panel will house the entire Control Panel, including the mode switcher, glider selection, and all interactive sliders.  
  * **Right Panel (approx. 60-65% width):** This panel is dedicated to the visualizations. The main Polar Curve Graph will occupy the top portion, with the Ground Reference Visualization displayed directly below it.  
* **Mobile Layout (screens narrower than \~768px):** A single-column, vertical layout is necessary for usability on smaller screens.  
  * **Order of Elements:** The Polar Curve Graph will be at the top, followed immediately by the Ground Reference Visualization. This prioritizes the visual output.  
  * **Control Panel:** The Control Panel will be located below the visualizations. It may be implemented as a collapsible accordion or a drawer that can be toggled by the user, ensuring it does not obstruct the graphs when not in use. All control elements (sliders, buttons) must be designed with large touch targets for ease of use.

### **4.2 Control Panel Design**

The control panel is the primary interaction hub for the user. Its design must be clean, logical, and must clearly distinguish between the two user modes.

#### **4.2.1 Mode Switcher**

A prominent toggle switch or button must be present at the top of the control panel. This control will switch the entire interface between "Simple" and "Advanced" modes.

* **Labels:** "Simple" / "Advanced"  
* **German:** Einfach / Erweitert  
* **French:** Simple / Avancé

#### **4.2.2 Basic Mode Controls (Default View)**

This mode is designed for pilots new to the concepts, focusing on intuitive cause-and-effect relationships. The interface should be uncluttered, presenting only the most essential controls.

1. **Glider Selection:** A user-friendly component for choosing the glider type. This should be implemented as a series of large, clickable cards or icons, each with an image or silhouette and the name of the glider class (e.g., "EN-A Beginner"). A simple dropdown menu is an acceptable alternative, particularly for mobile layouts.  
2. **Pilot Control:** The single slider described in Part II, representing the continuum from full brakes to full speedbar. It should be visually anchored with icons (e.g., a brake toggle handle and a speedbar pulley system) at its ends to make its function immediately obvious.  
3. **Environment Control:** A single, simplified horizontal slider for "Wind." The center position represents zero wind. Moving the slider to the left introduces an increasing headwind, while moving it to the right introduces an increasing tailwind. The labels should be qualitative (e.g., "Strong Headwind," "Calm," "Strong Tailwind") rather than numerical to maintain simplicity.

#### **4.2.3 Advanced Mode Controls (Hidden by Default)**

This mode is for experienced pilots and those wishing to explore the underlying physics in detail. It exposes the precise numerical data and separates the environmental controls into their constituent components.

1. **Glider Selection:** Same as in Basic Mode.  
2. **Pilot Control:** Same slider as in Basic Mode.  
3. **Environment Controls:** The single wind slider is replaced by two independent sliders:  
   * **Headwind / Tailwind:** A slider with a precise numerical input/display (in km/h).  
   * **Lift / Sink:** A slider with a precise numerical input/display (in m/s).  
4. **Data Display Panel:** A dedicated, non-interactive text area that displays the following calculated values in real-time, updated continuously as the user manipulates the controls:  
   * Airspeed (Vx​)  
   * Sink Rate (Vz​)  
   * Groundspeed  
   * Glide Ratio (through air)  
   * Glide Ratio (over ground)  
5. **Unit Selection:** A set of radio buttons or a dropdown in the Advanced Mode panel allowing the user to switch the display units between km/h, m/s, mph, and knots for all relevant speed values.

### **4.3 Visual Feedback and Interaction**

A high-quality user experience depends on smooth and immediate feedback.

* **Transitions:** All changes in the visualization (movement of the indicator on the curve, shifting of the curve itself, changes in the ground track angle) must be smoothly animated (e.g., using CSS transitions or a JavaScript animation library). This avoids jarring jumps and reinforces the sense of a dynamic system.  
* **State Indication:** All interactive elements must have clear :hover and :active (or touch-equivalent) states to indicate interactivity.  
* **State Resets:** When a user changes a fundamental parameter, such as the glider type, the simulation state (e.g., the position of the glider in the ground track view) should reset to provide a clean slate for the new configuration.

## **Part V: Technical Architecture & Internationalization (i18n)**

### **Objective**

This section provides the programmer with a clear blueprint for the project's technical structure, emphasizing maintainability, data management, and a robust, scalable approach to multi-language support as requested.

### **5.1 Project Structure**

As a single-page static website, the file structure should be simple and logical.

* index.html: The main HTML document containing the structure of the page.  
* /css/style.css: The stylesheet for all visual presentation.  
* /js/script.js: The main JavaScript file containing the application logic, including the physics engine, UI event handling, and visualization rendering.  
* /data/: A directory to hold external data files.  
* /lang/: A directory to hold the language translation files.  
* /assets/: A directory for images, icons, and other media.

Externalizing data and text strings from the core JavaScript logic is crucial for maintainability and scalability.

### **5.2 Data Structures**

To facilitate easy updates and management, all glider performance data should be stored in an external JSON file.

* **gliders.json:** This file, located in the /data/ directory, will contain an array of objects. Each object will represent a single glider class and follow a consistent structure:

JSON

\[  
  {  
    "id": "en-a",  
    "name\_key": "glider\_en\_a",  
    "polar\_data": {  
      "min\_sink\_speed\_kmh": 26,  
      "min\_sink\_rate\_ms": \-1.10,  
      "trim\_speed\_kmh": 35,  
      "trim\_sink\_rate\_ms": \-1.20,  
      "max\_speed\_kmh": 45,  
      "max\_speed\_sink\_rate\_ms": \-2.20,  
      "best\_glide\_ratio": 8.5  
    }  
  },  
  //... other glider objects  
\]

This structure allows the application to load all glider data with a single fetch request and decouples the performance data from the application code.

### **5.3 Internationalization (i18n) Framework**

A simple yet effective key-value pair system is recommended for handling translations. This avoids the need for complex i18n libraries for a project of this scope.

* **Language Files:** Separate JSON files will be created for each supported language (e.g., en.json, fr.json, de.json) and placed in the /lang/ directory.  
* **File Structure:** Each file will contain a flat object of key-value pairs for all user-facing strings.

Example en.json:

JSON

{  
  "app\_title": "Paraglider Polar Curve Visualizer",  
  "controls\_title": "Controls",  
  "glider\_selection\_label": "Select Glider",  
  "glider\_en\_a": "EN-A (Beginner)",  
  "controls\_wind": "Wind",  
  "term\_airspeed": "Airspeed",  
  //... all other strings  
}

* **Implementation:** A JavaScript function will be responsible for language management. On initial page load, it will:  
  1. Detect the user's browser language (navigator.language).  
  2. If a corresponding translation file exists, load it. Otherwise, default to English.  
  3. Provide a simple language switcher (e.g., flag icons) in the UI to allow the user to override the detected language.  
  4. When a language is loaded, the function will iterate through all elements in the HTML that have a data-i18n-key attribute and populate their content from the loaded language object. For example: \<h1 data-i18n-key="app\_title"\>\</h1\>.

### **5.4 Multilingual Jargon Table**

The credibility of the tool for its target audience hinges on the use of correct, idiomatic terminology. Direct, literal translations are often incorrect in specialized fields like aviation. The following table provides the correct jargon for key terms across the supported languages and must be used to populate the language files.5

| English | German (Deutsch) | French (Français) |
| :---- | :---- | :---- |
| Paraglider | Gleitschirm | Parapente |
| Polar Curve | Geschwindigkeitspolare | Polaire des vitesses |
| Glide Ratio | Gleitverhältnis / Gleitzahl | Finesse |
| Sink Rate | Sinkrate / Eigensinken | Taux de chute |
| Airspeed | Fluggeschwindigkeit | Vitesse air |
| Groundspeed | Geschwindigkeit über Grund | Vitesse sol |
| Speedbar | Beschleuniger | Accélérateur |
| Brakes | Bremsen | Freins |
| Headwind | Gegenwind | Vent de face |
| Tailwind | Rückenwind | Vent arrière |
| Thermal / Lift | Thermik / Steigen | Thermique / Ascendance |
| Minimum Sink | Geringstes Sinken | Taux de chute minimum |
| Best Glide | Bestes Gleiten | Finesse maximale |
| Trim Speed | Trimmgeschwindigkeit | Vitesse bras hauts |

## **Part VI: Strategic Enhancements & Future Development**

### **Objective**

This section addresses the user's request for additional ideas by proposing a set of strategic enhancements. These features are designed to deepen the educational value and utility of the tool for its target audience without diluting its core purpose. They build upon the established framework and introduce advanced concepts in an accessible way.

### **6.1 Scenario-Based Presets**

To help users, especially those newer to flight theory, understand the practical application of the polar curve, a system of pre-configured scenarios should be implemented.

* **Functionality:** A dropdown menu in the control panel would offer several common flight scenarios. Selecting a scenario would automatically set the environmental sliders (wind and lift/sink) to typical values associated with that situation.  
* **Example Scenarios:**  
  * **"Calm Evening Glide":** Sets wind and lift/sink to zero. The perfect baseline for understanding a glider's intrinsic performance.  
  * **"Ridge Soaring":** Sets a moderate headwind and a slight lift value, simulating the conditions found when flying in dynamic lift in front of a hill.  
  * **"Valley Crossing":** Introduces a significant headwind and a moderate sink rate, a classic challenge for cross-country pilots. This preset would immediately demonstrate the necessity of using the speedbar to achieve the best glide over ground.  
  * **"Strong Thermal Climb":** Sets a strong lift value (e.g., \+4 m/s) with minimal wind, showing how the entire polar curve shifts upwards, making altitude gain possible at a wide range of speeds.

This feature transforms the tool from a purely manual sandbox into a guided learning experience, providing instant context and practical examples.

### **6.2 The MacCready Ring Visual Overlay (Advanced Mode)**

For advanced users, the inclusion of a MacCready ring would be a significant value-add, introducing a core concept from competitive sailplane and paraglider flying.

* **Concept:** The MacCready theory is used to determine the optimal speed-to-fly between thermals to maximize overall cross-country speed. The pilot sets the ring based on their expectation of the strength of the *next* thermal they will encounter.10  
* **Functionality:**  
  1. In Advanced Mode, a new input would appear, labeled "MacCready Setting" or "Next Expected Climb (m/s)."  
  2. When the user inputs a value (e.g., 3 m/s), a visual ring or scale appears around the polar graph.  
  3. The simulation then calculates the optimal speed-to-fly through the *current* airmass (with its given sink rate) to arrive at the next thermal with the best possible efficiency. This is typically done by finding the tangent to the polar curve that intersects the vertical axis at the MacCready setting value.  
  4. A new marker, "MacCready Speed," would appear on the polar curve, visually guiding the user to the correct speed to fly.

This feature would elevate the tool to a genuine cross-country flight computer simulator, providing immense value for performance-oriented pilots.

### **6.3 Simple 3D Visuals**

While maintaining the project's scope as a static website, a touch of visual polish can be added to the ground reference visualization to increase engagement.

* **Implementation:** Using a lightweight WebGL library such as three.js, the 2D glider icon in the ground-track view could be replaced with a simple, low-polygon 3D model of a paraglider.  
* **Dynamic Behavior:** This model would not require complex 3D physics. Instead, its orientation could be subtly linked to the simulation state:  
  * **Pitch:** The model's angle of attack could visually change, pitching slightly nose-down as the speedbar is applied.  
  * **Roll/Yaw:** The model could exhibit a slight bank or crab angle when flying in a crosswind (a potential future extension) or when turning.

This enhancement adds a layer of visual sophistication and provides richer, more intuitive feedback without fundamentally altering the 2D nature of the core simulation.

### **6.4 Wing Loading Effects (Advanced Feature)**

Another critical concept in performance flying is the effect of wing loading. Adding an interactive control for this would complete the set of primary variables that affect a glider's polar curve.

* **Functionality:** In Advanced Mode, a slider labeled "Wing Loading" or "Pilot Weight" would be added. The range would be from the low end to the high end of a typical certified weight range for a given glider size.  
* **Algorithm:** As the user increases the wing loading, the entire polar curve must be recalculated and redrawn. The curve will shift **down and to the right**.6  
* **Educational Outcome:** This visually demonstrates to the user that a more heavily loaded glider:  
  * Flies faster at all points (trim, min sink, max speed).  
  * Sinks faster at all speeds.  
  * Maintains approximately the same best glide ratio, but achieves it at a higher airspeed.6

This is a non-intuitive but fundamental principle of glider flight, and providing an interactive demonstration would be an invaluable learning tool.

## **Part VII: Domain Name Strategy & Recommendations**

### **Objective**

This section provides a strategic analysis and a curated list of recommended domain names for the project. The recommendations are based on principles of branding, memorability, search engine optimization (SEO), and availability, tailored to the specific niche of this application.

### **7.1 Naming Principles**

The selection of a domain name is a critical strategic decision that impacts the project's identity, credibility, and discoverability. The following principles have guided the recommendations 39:

* **Memorable & Short:** The name should be easy for pilots to recall, type, and share with others. Shorter names are generally preferable.  
* **Relevant & Descriptive:** The name should clearly communicate the purpose of the tool. Incorporating keywords like "glide," "polar," "viz" (for visualization), or "sim" (for simulator) is highly beneficial for both user understanding and SEO.  
* **Brandable:** The name should sound like a distinct product or project, not a generic, keyword-stuffed phrase.  
* **TLD Preference:** The .com top-level domain (TLD) is the global standard and carries the most authority and user trust.40 It is the strongly preferred option. For a project with a European focus, a  
  .eu TLD is a viable alternative. Tech-focused TLDs like .app or .tools are also relevant and professional.  
* **Avoid:** Hyphens, numbers, and unconventional spellings should be avoided as they are harder to remember and can appear less professional.

### **7.2 Keyword Combinations**

The naming strategy involves combining a primary keyword that evokes the feeling or subject of flight with a secondary keyword that describes the tool's function.

* **Primary Keywords:** Glide, Polar, Fly, Path, Wing  
* **Secondary Keywords:** Viz, Sim, Calc, Lab, Tools, Hub

### **7.3 Specific Domain Suggestions**

An availability check has been performed using standard domain registration and WHOIS lookup tools as of the date of this report.40 The following domains are recommended based on the principles above.

#### **7.3.1 Top Recommendations (.com)**

These names are short, highly brandable, contain relevant keywords, and use the preferred .com extension.

1. **glidepolar.com**: Concise and professional. It combines the two most important keywords, "glide" and "polar," into a single, memorable name.  
2. **polarviz.com**: Modern and descriptive. "Viz" is a common and well-understood abbreviation for "visualization," making the site's purpose immediately clear.  
3. **flypolar.com**: Action-oriented and easy to remember. It directly connects the action of flying with the core concept of the polar curve.  
4. **glidepathsim.com**: More descriptive and excellent for SEO. "Glide path simulator" is a likely search term for users looking for such a tool.

#### **7.3.2 Strong Alternatives (Other TLDs)**

If the primary .com options are unavailable or if a different branding approach is desired, these alternatives are strong contenders.

* **glidepolar.app**: The .app TLD is modern and perfectly suited for an interactive web application.  
* **paraglide.tools**: A clear, descriptive name that positions the site as a utility for the paragliding community.  
* **polar.flights**: A creative and evocative name that is easy to remember.  
* **glideviz.eu**: An excellent choice if the primary target audience is based in Europe, signaling a regional focus.

It is strongly recommended that the chosen domain be registered immediately through a reputable registrar to ensure it is secured for the project.

#### **Works cited**

1. Physics:Polar curve (aerodynamics) \- HandWiki, accessed August 28, 2025, [https://handwiki.org/wiki/Physics:Polar\_curve\_(aerodynamics)](https://handwiki.org/wiki/Physics:Polar_curve_\(aerodynamics\))  
2. Paragliding Glossary \- Temple Pilots, accessed August 28, 2025, [https://www.templepilots.com/paragliding-glossary/](https://www.templepilots.com/paragliding-glossary/)  
3. Polar Curve \- Paragliding ABC, accessed August 28, 2025, [https://www.paraglidingabc.com/](https://www.paraglidingabc.com/)  
4. Speed To Fly Basics \- Flybubble, accessed August 28, 2025, [https://flybubble.com/blog/speed-to-fly-basics](https://flybubble.com/blog/speed-to-fly-basics)  
5. Polaire des vitesses parapente: comprendre les performances, accessed August 28, 2025, [https://annecyminivoiles.com/polaire-vitesses-parapente/](https://annecyminivoiles.com/polaire-vitesses-parapente/)  
6. xp-soaring \> Glider Polars, accessed August 28, 2025, [https://xp-soaring.github.io/dev/polars/polar.html](https://xp-soaring.github.io/dev/polars/polar.html)  
7. Polaire des vitesses \- Wikipédia, accessed August 28, 2025, [https://fr.wikipedia.org/wiki/Polaire\_des\_vitesses](https://fr.wikipedia.org/wiki/Polaire_des_vitesses)  
8. Polar Gear | Paragliding-mexico, accessed August 28, 2025, [https://parapente-mexico.com/en/mecanique-de-vol/gliders-polar-curse/](https://parapente-mexico.com/en/mecanique-de-vol/gliders-polar-curse/)  
9. polar curve basics an introduction to the polar curve for a sailplane \- YouTube, accessed August 28, 2025, [https://www.youtube.com/watch?v=tmx8KmSTA7Q](https://www.youtube.com/watch?v=tmx8KmSTA7Q)  
10. La Polaire – Rocher bleu, accessed August 28, 2025, [https://rocherbleu.com/parapente/polaire/](https://rocherbleu.com/parapente/polaire/)  
11. About the data \- Comparaglider, accessed August 28, 2025, [https://comparaglider.com/about](https://comparaglider.com/about)  
12. How does UP measure the performance of a paraglider?, accessed August 28, 2025, [https://www.up-paragliders.com/service/faq/products/how-does-up-measure-the-performance-of-a-paraglider](https://www.up-paragliders.com/service/faq/products/how-does-up-measure-the-performance-of-a-paraglider)  
13. View topic \- Glide Ratio?? \- new \- Paragliding Forum, accessed August 28, 2025, [https://www.paraglidingforum.com/viewtopic.php?t=73162](https://www.paraglidingforum.com/viewtopic.php?t=73162)  
14. Paragliders: Comparing Performance \- Flybubble, accessed August 28, 2025, [https://flybubble.com/blog/paragliders-comparing-performance](https://flybubble.com/blog/paragliders-comparing-performance)  
15. PACE \- skywalk Paragliders, accessed August 28, 2025, [https://skywalk.info/project/pace/](https://skywalk.info/project/pace/)  
16. Paraglider Performance Comparision \- Definition \- Expanding Knowledge, accessed August 28, 2025, [https://www.expandingknowledge.com/Jerome/PG/Gear/Wing/Perf/Polar/Compare/Definition\_English.htm](https://www.expandingknowledge.com/Jerome/PG/Gear/Wing/Perf/Polar/Compare/Definition_English.htm)  
17. single skin paragliding: everything you need to know \- Air et Aventure, accessed August 28, 2025, [https://www.airetaventure.com/en/blog/5\_single-skin-paragliding-everything-you-need-to-know.html](https://www.airetaventure.com/en/blog/5_single-skin-paragliding-everything-you-need-to-know.html)  
18. Passive Safety in flying miniwings and speedwings \- Speedflying School, accessed August 28, 2025, [https://speedflyingschool.com/2023/02/07/passive-safety-in-flying-miniwings-and-speedwings/](https://speedflyingschool.com/2023/02/07/passive-safety-in-flying-miniwings-and-speedwings/)  
19. Choosing your paraglider according to your flight level \- Air et Aventure, accessed August 28, 2025, [https://www.airetaventure.com/en/content/88-choose-paraglider-level](https://www.airetaventure.com/en/content/88-choose-paraglider-level)  
20. Paraglider Wing EN Ratings And How To Stay Safe \- adventuro, accessed August 28, 2025, [https://adventuro.com/paraglider-wing-en-ratings-and-how-to-stay-safe/](https://adventuro.com/paraglider-wing-en-ratings-and-how-to-stay-safe/)  
21. Supair Birdy review (EN A) \- Cross Country Magazine, accessed August 28, 2025, [https://xcmag.com/gear-guide/paraglider-reviews/supair-birdy-review-en-a/](https://xcmag.com/gear-guide/paraglider-reviews/supair-birdy-review-en-a/)  
22. Paragliders: Which Class? \- Flybubble, accessed August 28, 2025, [https://flybubble.com/blog/paragliders-which-class](https://flybubble.com/blog/paragliders-which-class)  
23. B or B+: what's the difference? \- Supair, accessed August 28, 2025, [https://supair.com/en/b-ou-b-comment-sy-retrouver/](https://supair.com/en/b-ou-b-comment-sy-retrouver/)  
24. Which EN B paraglider to choose \- Air et Aventure, accessed August 28, 2025, [https://www.airetaventure.com/en/content/85-paraglider-wing-en-b](https://www.airetaventure.com/en/content/85-paraglider-wing-en-b)  
25. EN B Paraglider Reviews \- Cross Country Magazine, accessed August 28, 2025, [https://xcmag.com/gear-guide/paraglider-reviews/en-b-paraglider-reviews/](https://xcmag.com/gear-guide/paraglider-reviews/en-b-paraglider-reviews/)  
26. Which Paraglider? How to Choose a Wing, accessed August 28, 2025, [https://www.passionparagliding.com/how-to-choose-a-paraglider](https://www.passionparagliding.com/how-to-choose-a-paraglider)  
27. Comparative EN C 2-line paraglider 2023 \- Grands Espaces \- Parapente Annecy, accessed August 28, 2025, [https://grandsespaces.com/en/comparison-of-2-line-c-paragliders-2023/](https://grandsespaces.com/en/comparison-of-2-line-c-paragliders-2023/)  
28. PIPER TANDEM \- itv wings, accessed August 28, 2025, [https://www.itv-wings.com/en/wings-paramotor-paragliding/piper-tandem-itv.html](https://www.itv-wings.com/en/wings-paramotor-paragliding/piper-tandem-itv.html)  
29. BGD DUAL 2 TANDEM Glider | Effortless Launching Smooth, accessed August 28, 2025, [https://paraglidingequipment.com/dual-2-tandem/](https://paraglidingequipment.com/dual-2-tandem/)  
30. Tensing / Independence paragliding, accessed August 28, 2025, [https://www.independence.aero/en/paragliders/tensing/](https://www.independence.aero/en/paragliders/tensing/)  
31. Outback | MAC PARA, accessed August 28, 2025, [https://www.macpara.com/en/previous-products/outback/](https://www.macpara.com/en/previous-products/outback/)  
32. paragliding \- French English Dictionary \- Tureng, accessed August 28, 2025, [https://tureng.com/en/french-english/paragliding](https://tureng.com/en/french-english/paragliding)  
33. Papillon Gleitschirm-Glossar \- Papillon Paragliding, accessed August 28, 2025, [https://papillon.de/gleitschirm-glossar/](https://papillon.de/gleitschirm-glossar/)  
34. Paragliding glossary: all the terms of free flight \- Freedom Parapente, accessed August 28, 2025, [https://www.freedom-parapente.fr/en/glossary](https://www.freedom-parapente.fr/en/glossary)  
35. Lexique parapente : tous les termes du vol libre \- Freedom Parapente, accessed August 28, 2025, [https://www.freedom-parapente.fr/lexique](https://www.freedom-parapente.fr/lexique)  
36. German Translation of “PARAGLIDING” | Collins English-German Dictionary, accessed August 28, 2025, [https://www.collinsdictionary.com/dictionary/english-german/paragliding](https://www.collinsdictionary.com/dictionary/english-german/paragliding)  
37. Glossaire des termes de parapente \- Overfly Tenerife, accessed August 28, 2025, [https://overflytenerife.com/fr/glossaire-des-termes-de-parapente/](https://overflytenerife.com/fr/glossaire-des-termes-de-parapente/)  
38. Das Gleitschirm Lexikon von A-Z \- Paragliding24.ch, accessed August 28, 2025, [https://paragliding24.ch/blogs/blog/das-gleitschirm-lexikon-von-a-z](https://paragliding24.ch/blogs/blog/das-gleitschirm-lexikon-von-a-z)  
39. Domain Name Search – Check and Buy a Domain In Minutes \- Hostinger, accessed August 28, 2025, [https://www.hostinger.com/domain-name-search](https://www.hostinger.com/domain-name-search)  
40. Domain Name Search | Free Check Domain Availability Tool \- Namecheap, accessed August 28, 2025, [https://www.namecheap.com/domains/domain-name-search/](https://www.namecheap.com/domains/domain-name-search/)  
41. Free Whois Lookup \- Whois IP Search & Whois Domain Lookup | Whois.com, accessed August 28, 2025, [https://www.whois.com/whois/](https://www.whois.com/whois/)  
42. Domain Name Search \- Check Domain Availability, accessed August 28, 2025, [https://www.name.com/domain/search](https://www.name.com/domain/search)  
43. Domain Name Search: Find Available Domains Instantly, accessed August 28, 2025, [https://instantdomainsearch.com/](https://instantdomainsearch.com/)  
44. Domain Name Search | Check Domain Availability Online \- DNS Checker, accessed August 28, 2025, [https://dnschecker.org/search-domain-name-checker.php](https://dnschecker.org/search-domain-name-checker.php)