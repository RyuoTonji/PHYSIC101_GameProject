# Physics Validation Matrix & Acceptance Benchmark

**Project**: Physics 101: The Mechanics Odyssey  
**Specification**: Master Development Prompt (Section 19, 20, 21, 22, and Section 35 Step 5)

---

## 1. Tolerances & Precision Standards

All numerical comparisons between analytical solutions and numerical/simulation integrations adhere to strict tolerance bounds:

| Physical Quantity | Symbol | SI Unit | Analytical Tolerance | Simulation Tolerance |
| :--- | :--- | :--- | :--- | :--- |
| **Position / Displacement** | $x, y, \Delta r$ | $\text{m}$ | $\pm 10^{-6}\text{ m}$ (exact float) | $\pm 0.05\text{ m}$ |
| **Velocity / Speed** | $v, \vec{v}$ | $\text{m/s}$ | $\pm 10^{-6}\text{ m/s}$ | $\pm 0.05\text{ m/s}$ |
| **Acceleration** | $a, \vec{a}$ | $\text{m/s}^2$ | $\pm 10^{-6}\text{ m/s}^2$ | $\pm 0.05\text{ m/s}^2$ |
| **Force** | $F, \vec{F}$ | $\text{N}$ | $\pm 10^{-6}\text{ N}$ | $\pm 0.05\text{ N}$ |
| **Time Period** | $T$ | $\text{s}$ | $\pm 10^{-6}\text{ s}$ | $\pm 0.0167\text{ s}$ (1 frame @ 60Hz) |
| **Frequency** | $f$ | $\text{Hz}$ | $\pm 10^{-6}\text{ Hz}$ | $\pm 0.05\text{ Hz}$ |
| **Angular Velocity** | $\omega$ | $\text{rad/s}$ | $\pm 10^{-6}\text{ rad/s}$ | $\pm 0.05\text{ rad/s}$ |

---

## 2. Benchmark Test Cases (Analytical Ground Truth)

### Level 1: Distance vs. Displacement
- **Test Case L1.1 (2D Triangle Walk)**:
  - Trajectory: $(0, 0) \to (10, 0) \to (10, 10)$
  - Distance: $d = 10 + 10 = 20.00\text{ m}$
  - Displacement Vector: $\Delta \vec{r} = (10, 10)\text{ m}$
  - Displacement Magnitude: $\|\Delta \vec{r}\| = \sqrt{10^2 + 10^2} = 14.142136\text{ m}$
  - Displacement Angle: $\theta = 45.0^\circ$ ($0.785398\text{ rad}$)
  - Invariant Check: $d > \|\Delta \vec{r}\|$ ($20 > 14.142136$)
- **Test Case L1.2 (Loop / Closed Path)**:
  - Trajectory: $(0, 0) \to (5, 0) \to (5, 5) \to (0, 5) \to (0, 0)$
  - Distance: $d = 20.00\text{ m}$
  - Displacement Vector: $\Delta \vec{r} = (0, 0)\text{ m}$
  - Displacement Magnitude: $\|\Delta \vec{r}\| = 0.00\text{ m}$
- **Test Case L1.3 (Straight Path)**:
  - Trajectory: $(0, 0) \to (15, 0)$
  - Distance: $d = 15.00\text{ m}$
  - Displacement Magnitude: $\|\Delta \vec{r}\| = 15.00\text{ m}$
  - Invariant Check: $d = \|\Delta \vec{r}\|$

### Level 2: Average Speed vs. Average Velocity
- **Test Case L2.1 (Specification Benchmark)**:
  - Total distance $d = 100\text{ m}$ in $t = 20\text{ s}$
  - Net displacement $\Delta \vec{r} = (60, 0)\text{ m}$ East
  - Average Speed: $v_{\text{avg}} = 100 / 20 = 5.000\text{ m/s}$
  - Average Velocity: $\vec{v}_{\text{avg}} = (3.000, 0.000)\text{ m/s}$ East ($\|\vec{v}_{\text{avg}}\| = 3.000\text{ m/s}$)
- **Test Case L2.2 (Out-and-Back Runner)**:
  - Out: $40\text{ m}$ forward in $8\text{ s}$
  - Back: $40\text{ m}$ backward in $12\text{ s}$
  - Total distance $d = 80\text{ m}$, total time $t = 20\text{ s}$
  - Net displacement $\Delta x = 0\text{ m}$
  - Average Speed: $v_{\text{avg}} = 4.000\text{ m/s}$
  - Average Velocity: $v_{\text{avg}, x} = 0.000\text{ m/s}$

### Level 3: Acceleration
- **Test Case L3.1 (Acceleration from Rest)**:
  - $v_i = 0\text{ m/s}$, $v_f = 20\text{ m/s}$, $t = 5\text{ s}$
  - $a = \frac{20 - 0}{5} = 4.000\text{ m/s}^2$
- **Test Case L3.2 (Braking / Deceleration)**:
  - $v_i = 25\text{ m/s}$, $v_f = 5\text{ m/s}$, $t = 4\text{ s}$
  - $a = \frac{5 - 25}{4} = -5.000\text{ m/s}^2$
  - Deceleration check: $\vec{v} \cdot \vec{a} = (25)(-5) = -125 < 0$ (braking confirmed)

### Level 4: Uniformly Accelerated Rectilinear Motion (UARM)
- **Test Case L4.1 (Prompt Specification Example)**:
  - $v_i = 5\text{ m/s}$, $a = 2\text{ m/s}^2$, $t = 4\text{ s}$
  - Final Velocity: $v_f = 5 + 2(4) = 13.000\text{ m/s}$
  - Displacement: $\Delta x = 5(4) + \frac{1}{2}(2)(4^2) = 20 + 16 = 36.000\text{ m}$
  - Torricelli Check: $v_f^2 = 5^2 + 2(2)(36) = 25 + 144 = 169 \implies v_f = 13.000\text{ m/s}$
  - Mean Speed Check: $\Delta x = \frac{5 + 13}{2} \times 4 = 9 \times 4 = 36.000\text{ m}$
- **Test Case L4.2 (Stopping Distance)**:
  - $v_i = 20\text{ m/s}$, $v_f = 0\text{ m/s}$, $a = -4\text{ m/s}^2$
  - Stopping time: $t = \frac{0 - 20}{-4} = 5.000\text{ s}$
  - Stopping distance: $\Delta x = \frac{0^2 - 20^2}{2(-4)} = \frac{-400}{-8} = 50.000\text{ m}$

### Level 5: Rotation, Revolution, and Period
- **Test Case L5.1 (Prompt Example)**:
  - $12\text{ s}$ elapsed for $N = 3\text{ cycles}$
  - Period $T = 12 / 3 = 4.000\text{ s}$
  - Frequency $f = 1 / T = 0.250\text{ Hz}$
  - Angular speed $\omega = 2\pi f = 2\pi(0.25) = 1.570796\text{ rad/s} \approx \frac{\pi}{2}\text{ rad/s}$

### Level 6: Linear Speed vs. Rotational Speed
- **Test Case L6.1 (Prompt Rotating Disk Example)**:
  - $\omega = 2.000\text{ rad/s}$
  - Point A ($r_1 = 1\text{ m}$): $v_1 = 1 \times 2 = 2.000\text{ m/s}$
  - Point B ($r_2 = 2\text{ m}$): $v_2 = 2 \times 2 = 4.000\text{ m/s}$
  - Point C ($r_3 = 3\text{ m}$): $v_3 = 3 \times 2 = 6.000\text{ m/s}$
  - Invariant Check: $v_3 > v_2 > v_1$ while $\omega_1 = \omega_2 = \omega_3$

### Level 7: Tangential Velocity & Centripetal Acceleration
- **Test Case L7.1 (Centripetal Acceleration via v)**:
  - $v = 10.000\text{ m/s}$, $r = 5.000\text{ m}$
  - $a_c = \frac{v^2}{r} = \frac{10^2}{5} = \frac{100}{5} = 20.000\text{ m/s}^2$
  - Direction: Radially inward toward center $(-\hat{r})$
- **Test Case L7.2 (Centripetal Acceleration via $\omega$)**:
  - $\omega = 2.000\text{ rad/s}$, $r = 5.000\text{ m}$
  - $a_c = r \omega^2 = 5 \times 2^2 = 20.000\text{ m/s}^2$
  - Equivalence Check: $v = r\omega = 10\text{ m/s} \implies a_c(v) = a_c(\omega)$

### Level 8: Centripetal Force & Real-World Applications
- **Test Case L8.1 (Ball on String)**:
  - $m = 2.000\text{ kg}$, $v = 10.000\text{ m/s}$, $r = 5.000\text{ m}$
  - $F_c = \frac{m v^2}{r} = \frac{2 \times 10^2}{5} = 40.000\text{ N}$
  - Required String Tension: $T_{\text{string}} = 40.000\text{ N}$
- **Test Case L8.2 (Hint 3 Example from Prompt Page 11)**:
  - $m = 2.000\text{ kg}$, $v = 4.000\text{ m/s}$, $r = 2.000\text{ m}$
  - $F_c = \frac{2 \times 4^2}{2} = 16.000\text{ N}$

---

## 3. Edge Cases Matrix

| Category | Input Scenario | Expected Behavior |
| :--- | :--- | :--- |
| **Zero Time** | $\Delta t = 0$ in average speed/velocity/acceleration | Throws `PhysicsDivisionByZeroError` with clear message |
| **Zero Radius** | $r = 0$ in centripetal acceleration / force | Throws `PhysicsSingularityError` with clear message |
| **Negative Time** | $\Delta t < 0$ | Throws `InvalidPhysicsValueError` (time must be non-negative) |
| **Negative Radius** | $r < 0$ | Throws `InvalidPhysicsValueError` (radius must be strictly positive) |
| **Negative Mass** | $m \le 0$ | Throws `InvalidPhysicsValueError` (mass must be strictly positive) |
| **Zero Distance** | $d = 0$, $\Delta t > 0$ | Returns $v = 0\text{ m/s}$ cleanly |
| **Negative Velocity / Acceleration** | $v_i = -10\text{ m/s}, a = -2\text{ m/s}^2$ | Correctly computes negative displacement and final velocity |
| **Extreme Large Numbers** | $r = 10^9\text{ m}, v = 10^6\text{ m/s}$ | Computes without overflow or precision loss ($a_c = 10^3\text{ m/s}^2$) |
| **Loss of Centripetal Force** | $F_{\text{inward}} \to 0$ | Body switches to rectilinear motion with current tangential velocity $\vec{v}_t$ |
