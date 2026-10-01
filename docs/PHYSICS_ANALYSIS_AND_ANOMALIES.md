# Physics Analysis & Anomaly Resolution Document

**Project**: Physics 101: The Mechanics Odyssey  
**Scope**: Verification of Source Syllabus / Specification and Scientific Resolutions

---

## 1. Analysis of Supplied Syllabus & PDF Prompt

In accordance with **Master Development Prompt (Section 30, Rules 1–4, and Section 35, Step 4)**, the source curriculum was subjected to critical scientific review. All identified discrepancies, ambiguities, and potential misconceptions are analyzed and resolved below against authoritative standards (*OpenStax University Physics*, *The Feynman Lectures*, *HyperPhysics*).

---

## 2. Identified Anomalies & Resolutions

### Anomaly 1: Dimensional Inconsistency in Torricelli Formula Table Row
- **Source Prompt Table (Page 2)**:
  `Final velocity | Constant acceleration | vf² = vi² + 2aΔx | m²/s² | Vector relationship`
- **Issue**:
  The quantity $v_f^2$ has units of $\text{m}^2/\text{s}^2$, but "Final velocity" $v_f$ has SI units of $\text{m/s}$. Furthermore, $v_f^2 = v_i^2 + 2a\Delta x$ is a scalar equation derived from work-energy / integration; squaring eliminates directional signs. Taking the square root yields $v_f = \pm \sqrt{v_i^2 + 2a\Delta x}$, where the sign must be determined from physical motion direction.
- **Resolution**:
  1. The game HUD and calculation engine will clearly distinguish $v_f^2$ (scalar speed squared, $\text{m}^2/\text{s}^2$) from final velocity $v_f$ (vector/signed scalar, $\text{m/s}$).
  2. When solving for $v_f$ from $v_f^2$, the system explicitly tracks sign direction according to the velocity vector sign convention.

### Anomaly 2: 1D vs 2D Displacement Representation
- **Source Prompt Table (Page 2 & 6)**:
  Page 2 lists $\Delta x = x_f - x_i$, whereas page 6 specifies 2D vector displacement $\Delta \vec{r} = \vec{r}_f - \vec{r}_i$ and magnitude $|\Delta \vec{r}| = \sqrt{(x_f-x_i)^2 + (y_f-y_i)^2}$.
- **Issue**:
  Conflating 1D scalar displacement $\Delta x$ with 2D vector displacement $\Delta \vec{r}$ risks confusing players. In 1D, displacement can be negative (indicating direction), while magnitude $|\Delta \vec{r}|$ is strictly non-negative.
- **Resolution**:
  The Physics System represents all spatial quantities natively as 2D vectors:
  $$\Delta \vec{r} = \begin{pmatrix} x_f - x_i \\ y_f - y_i \end{pmatrix}$$
  The HUD displays:
  - Vector components: $\Delta x$, $\Delta y$ (m)
  - Magnitude: $\|\Delta \vec{r}\|$ (m)
  - Direction angle: $\theta = \operatorname{atan2}(\Delta y, \Delta x)$ (degrees)
  - Total path distance: $d = \sum \Delta s$ (m)

### Anomaly 3: Missing Core Kinematic Formula in Syllabus
- **Source Prompt Table**:
  Lists $v_f = v_i + at$, $\Delta x = v_i t + \frac{1}{2}at^2$, and $v_f^2 = v_i^2 + 2a\Delta x$, but omits the average velocity kinematic relation:
  $$\Delta x = \left(\frac{v_i + v_f}{2}\right) t$$
- **Issue**:
  When solving kinematic puzzles where acceleration is unknown or implicit, players need this fundamental relation (which connects Level 2 average velocity with Level 4 constant acceleration).
- **Resolution**:
  Included in the core kinematics library as `calculate_displacement_from_average_velocity(vi, vf, t)`.

### Anomaly 4: "Centrifugal Force" Misconception in Level 8 (Scenario B - Washing Machine)
- **Source Prompt (Page 10)**:
  "Scenario B — Washing machine: Create a rotating drum... Do not teach the simplified misconception that 'centrifugal force pushes the water outward' as an inertial-frame fact."
- **Physics Clarification**:
  In an inertial reference frame:
  1. No outward force acts on the water or clothes.
  2. The drum walls exert an *inward normal force* on the clothes, providing the centripetal acceleration $\vec{a}_c = -\frac{v^2}{r}\hat{r}$ needed to keep them moving in a circle.
  3. The water droplets at the perforations experience no inward normal force (there is an opening/hole).
  4. By Newton's First Law (inertia), the unconstrained water droplets continue moving in a straight line along the instantaneous tangential velocity vector $\vec{v}_t$, passing through the holes and separating from the clothes.
- **Resolution**:
  The game's visualizer and explanation will explicitly trace the tangential trajectory of water escaping perforations, contrasting it with the inward contact force exerted on clothes.

### Anomaly 5: Division by Zero & Edge Cases in Physics Functions
- **Formulas Subject to Singularity**:
  1. $v_{\text{avg}} = d / \Delta t$ when $\Delta t = 0$
  2. $a_{\text{avg}} = \Delta v / \Delta t$ when $\Delta t = 0$
  3. $T = t / N$ when $N = 0$
  4. $f = 1 / T$ when $T = 0$
  5. $a_c = v^2 / r$ when $r = 0$
  6. $F_c = m v^2 / r$ when $r = 0$
- **Resolution**:
  All functions implement guarded mathematical contracts:
  - If $\Delta t \le 0$, throw descriptive `InvalidTimeException` or return structured Result `{ error: 'Time interval must be strictly positive', value: NaN }`.
  - If $r \le 0$ for centripetal calculations, return safe error result rather than propagating unhandled IEEE 754 `Infinity` or `NaN`.
  - Automated unit tests explicitly verify zero and negative input behavior.

---

## 3. Dimensional Analysis Summary

| Formula | Algebraic Form | Dimensional Expansion | Target Unit | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| Distance / Displacement | $\Delta r = \sqrt{\Delta x^2 + \Delta y^2}$ | $\sqrt{[L]^2 + [L]^2} = [L]$ | $\text{m}$ | **PASS** |
| Average Velocity | $\vec{v} = \Delta \vec{r} / \Delta t$ | $[L] / [T] = [L T^{-1}]$ | $\text{m/s}$ | **PASS** |
| Acceleration | $\vec{a} = \Delta \vec{v} / \Delta t$ | $[L T^{-1}] / [T] = [L T^{-2}]$ | $\text{m/s}^2$ | **PASS** |
| Kinematic Position | $x = v_i t + \frac{1}{2} a t^2$ | $[L T^{-1}][T] + [L T^{-2}][T]^2 = [L] + [L] = [L]$ | $\text{m}$ | **PASS** |
| Kinematic Velocity Squared | $v_f^2 = v_i^2 + 2 a \Delta x$ | $[L T^{-1}]^2 + [L T^{-2}][L] = [L^2 T^{-2}]$ | $\text{m}^2/\text{s}^2$ | **PASS** |
| Linear Speed | $v = r \omega$ | $[L] \times [T^{-1}] = [L T^{-1}]$ | $\text{m/s}$ | **PASS** |
| Centripetal Acceleration | $a_c = v^2 / r$ | $[L T^{-1}]^2 / [L] = [L^2 T^{-2}] / [L] = [L T^{-2}]$ | $\text{m/s}^2$ | **PASS** |
| Centripetal Acceleration | $a_c = r \omega^2$ | $[L] \times [T^{-1}]^2 = [L T^{-2}]$ | $\text{m/s}^2$ | **PASS** |
| Centripetal Force | $F_c = m v^2 / r$ | $[M] \times [L T^{-1}]^2 / [L] = [M L T^{-2}]$ | $\text{N} = \text{kg}\cdot\text{m/s}^2$ | **PASS** |
| Centripetal Force | $F_c = m r \omega^2$ | $[M] \times [L] \times [T^{-1}]^2 = [M L T^{-2}]$ | $\text{N} = \text{kg}\cdot\text{m/s}^2$ | **PASS** |

All formulas are dimensionally consistent and verified.
