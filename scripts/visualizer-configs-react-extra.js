/* React component-composition — separate file */
module.exports = { 'react': {

'component-composition': {
  language:'javascript', fileName:'ComponentComposition.jsx',
  steps:[
    { title:'Composition vs Inheritance in React',
      description:'React favors composition over inheritance. Build complex components by combining simpler ones. Use children prop and slot patterns to create flexible containers.',
      code:'// Container component using children prop\nfunction Card({ title, children, footer }) {\n  return (\n    <div className="card">\n      <div className="card-header">{title}</div>\n      <div className="card-body">{children}</div>\n      {footer && <div className="card-footer">{footer}</div>}\n    </div>\n  );\n}\n// Compose: pass any content as children\n<Card title="Java Mastery" footer={<Button>Start</Button>}>\n  <p>Master Java from beginner to expert.</p>\n  <ProgressBar value={42} />\n</Card>',
      highlight:[2,5,6,7,12,13,14],
      diagram:{ kind:'flow', steps:[
        {label:'Card: generic container shell', done:true},
        {label:'children: any React content injected', done:true},
        {label:'Compose: Card + Button + ProgressBar', active:true},
        {label:'No inheritance needed for reuse'},
      ]}},
    { title:'Compound Components pattern',
      description:'Compound Components share implicit state through context. Like select/option — parent manages state, children access it via context.',
      code:'const TabContext = createContext(null);\nfunction Tabs({ children, defaultTab }) {\n  const [active, setActive] = useState(defaultTab);\n  return (\n    <TabContext.Provider value={{ active, setActive }}>\n      <div className="tabs">{children}</div>\n    </TabContext.Provider>\n  );\n}\nTabs.Tab = function Tab({ id, children }) {\n  const { active, setActive } = useContext(TabContext);\n  return <button className={active === id ? "active" : ""} onClick={() => setActive(id)}>{children}</button>;\n};\n<Tabs defaultTab="java">\n  <Tabs.Tab id="java">Java</Tabs.Tab>\n  <Tabs.Tab id="spring">Spring</Tabs.Tab>\n</Tabs>',
      highlight:[1,4,6,10,14,15,16],
      diagram:{ kind:'boxes', title:'Compound component benefits', items:[
        {label:'Shared state via Context', color:'#10b981', value:'No prop drilling to children', highlight:true},
        {label:'Flexible API', color:'#818cf8', value:'User controls structure'},
        {label:'Co-located logic', color:'#f59e0b', value:'Tabs.Tab always used with Tabs'},
        {label:'Examples', color:'#60a5fa', value:'Select/Option, Tabs, Accordion'},
      ]}},
    { title:'Render Props pattern',
      description:'Render Props pass a function as prop that returns JSX. The parent handles data/state; the function decides rendering. Flexible but verbose (now often replaced by hooks).',
      code:'function MouseTracker({ render }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  return (\n    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>\n      {render(pos)}\n    </div>\n  );\n}\n// Usage:\n<MouseTracker render={({ x, y }) => <div>Mouse at ({x}, {y})</div>} />\n// Modern: custom hook (cleaner)\nfunction useMousePosition() {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  useEffect(() => { window.addEventListener("mousemove", e => setPos({ x: e.clientX, y: e.clientY })); }, []);\n  return pos;\n}',
      highlight:[2,5,10,12,13,14,15],
      diagram:{ kind:'boxes', title:'Render props vs hooks', items:[
        {label:'Render props', color:'#818cf8', value:'Function prop returns JSX - flexible'},
        {label:'HOC', color:'#f59e0b', value:'Wrap component - older pattern'},
        {label:'Custom hooks', color:'#10b981', value:'Modern - cleaner, composable', highlight:true},
        {label:'When to use render props', color:'#60a5fa', value:'When hook + JSX combination needed'},
      ]}},
    { title:'Component composition best practices',
      description:'Keep components small and focused. Lift state up to the lowest common ancestor. Avoid prop drilling with context. Use composition not configuration.',
      code:'// BAD: configuration prop explosion\n<Button showIcon iconPosition="left" iconSize="sm" iconColor="blue" />\n// GOOD: composition - compose from parts\n<Button>\n  <Icon name="arrow" size="sm" color="blue" />\n  <Text bold size="lg">Click me</Text>\n</Button>\n// Avoid prop drilling: use Context\nfunction App() {\n  const [user, setUser] = useState(null);\n  return (\n    <UserContext.Provider value={{ user, setUser }}>\n      <Sidebar />\n      <Main />\n    </UserContext.Provider>\n  );\n}',
      highlight:[4,5,6,12,13,14],
      diagram:{ kind:'flow', steps:[
        {label:'Configuration props: rigid, hard to extend', done:true},
        {label:'Composition: flexible, extensible', done:true},
        {label:'Context: avoid prop drilling deep trees', active:true},
        {label:'Key: small, focused, reusable components'},
      ]}},
    { title:'Higher-Order Components (HOC)',
      description:'A HOC is a function that takes a component and returns a new enhanced component. Used for cross-cutting concerns like auth guards.',
      code:'function withAuth(WrappedComponent) {\n  return function AuthenticatedComponent(props) {\n    const { user, loading } = useAuth();\n    if (loading) return <Spinner />;\n    if (!user) return <Navigate to="/login" />;\n    return <WrappedComponent {...props} user={user} />;\n  };\n}\nconst ProtectedDashboard = withAuth(Dashboard);\n// Modern: prefer hooks + conditional render\nfunction Dashboard() {\n  const { user } = useAuth();\n  if (!user) return <Navigate to="/login" />;\n  return <DashboardContent user={user} />;\n}',
      highlight:[2,4,5,6,9,11,12,13,14],
      diagram:{ kind:'boxes', title:'HOC rules', items:[
        {label:'Wraps component', color:'#10b981', value:'Returns enhanced component', highlight:true},
        {label:'Spread props', color:'#818cf8', value:'{...props} - pass through all props'},
        {label:'Display name', color:'#f59e0b', value:'Set displayName for debugging'},
        {label:'Modern: prefer hooks', color:'#60a5fa', value:'useAuth() cleaner than withAuth(HOC)'},
      ]}},
  ],
},

} }; // end module.exports

