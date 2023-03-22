//Import Statements
import React, { Fragment, useState, useEffect } from 'react'
import axios from 'axios'
import Navigation from '../reusables/Navigation'
import { Container, Jumbotron, Row, Card, Col } from 'react-bootstrap'
import Loading from '../reusables/Loading'
import Error from '../reusables/Error'
import { useHistory, Link, Redirect } from 'react-router-dom'
import useSession from '../hooks/useSession'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/UserActions'

//New Prototype Component
const NewPrototype: React.FC = () =>
{
    //LOGIC
    const session = useSession()
    const [state, setState] = useState({  title: '', description: '', link: '', alert: '' })
    const history = useHistory()
    const  dispatch = useDispatch()

    let handleSubmit = async(e:any) =>
    {
        e.preventDefault()
        setState({ ...state, alert: 'Creating Prototype' })
        
        axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token')

        try
        {
            const res = await axios.post('/api/prototype/new', state)
            const response = await axios.get('/api/account/dashboard')
            dispatch(setUser(response.data))
            setState({ ...state, alert: res.data.msg })
        } 

        catch (error) 
        {
            if(error.response.status === 401)
            {
                localStorage.removeItem('token')
                history.push('/auth/signin')
            }

            else
            {
                setState({ ...state, alert: error.response.data.msg })
            }
        }  
    }

    //JSX
    if(session.hasError)
    {
        return <Redirect to = '/auth/signin' />
    }

    else
    {
        return (
            <Fragment>
                <Navigation/>
                <form className="box" onSubmit={ handleSubmit }> 
                    <p className="logo logobox">New Prototype</p>
                    <input type="text" name="title" placeholder="Prototype Title" onChange={ (e) => setState({ ...state, title: e.target.value }) } autoComplete="off" required />
                    <textarea name="description" placeholder="Description" onChange={ (e) => setState({ ...state, description: e.target.value }) } autoComplete="off" required/>
                    <input type="url" name="link" placeholder="Prototype Link" onChange={ (e) => setState({ ...state, link: e.target.value }) } autoComplete="off" required/>
                    <p id="alert">{ state.alert }</p>
                    <button type="submit" className="btn btn-block">Create<i className="fas fa-chevron-right"></i></button>
                </form>
            </Fragment>   
        )
    }
}

//Library Component
const Library: React.FC = () =>
{
    //LOGIC
    const session = useSession()
    const [state, setState] = useState({ prototypes: [], isLoaded: false, show: false, alert: '' })
    const history = useHistory()
    const  dispatch = useDispatch()

    useEffect(() => 
    {
        let fetchLibrary = async() =>
        {
            try 
            {
                const response = await axios.get('/api/prototype/library')
                setState({ ...state, prototypes: response.data, isLoaded: true })
            } 
            
            catch (error) 
            {
                history.push('/auth/signin') 
            }
        }       

        fetchLibrary()   
    }, [])

    let handleDelete = async(id: any) =>
    {
        axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token')

        try 
        {
            let prototypes = state.prototypes.filter((prototype:any) =>
            {
                return id !== prototype._id
            })

            setState({ ...state, prototypes: prototypes })
            await axios.delete(`/api/prototype/delete/${id}`)
            const response = await axios.get('/api/account/dashboard')
            dispatch(setUser(response.data))
        } 
        
        catch (error) 
        {
            localStorage.removeItem('token')
            history.push('/auth/signin')
        }
    }

    let prototypeItems = state.prototypes.map((item:any)=>
    {
        return(
            <Col xs={12} sm={12} md={6} lg={6} xl={4} key={ Math.random()}> 
                <Card className="text-center" key={ item._id }>
                    <Link to={ `/prototype/view/${item._id}` }>
                        <Card.Header className="text-white" style={{ borderStartStartRadius: "0px", borderStartEndRadius: "0px", border: "none" }}>
                            <Row className="align-items-center">
                                <Col>
                                    <i className="fas fa-key fa-2x"></i>
                                </Col>
                                <Col>
                                    <p className="logo">{ item.title }</p>
                                    <p>{item.date.slice(0,15)}</p>
                                </Col>
                            </Row>
                        </Card.Header>
                    </Link>
                    <Card.Footer>
                        <Link to={ `/prototype/update/${item._id}` } className="btn"><i className="fas fa-pen"></i></Link>
                        <button className="btn" onClick={ () => handleDelete(item._id) }><i className="fas fa-trash"></i></button>
                    </Card.Footer>
                </Card>
            </Col>
        )
    })

    //JSX
    if(session.hasError)
    {
        return <Redirect to = '/auth/signin' />
    }

    else
    {
        if(state.isLoaded)
        {
            if(state.prototypes.length === 0)
            {
                return(
                    <Fragment>
                        <Navigation/>
                        <Error type="forward" message="No Prototypes" btn="New Prototype" btnlink="/prototype/new" />
                    </Fragment>
                ) 
            }
    
            else
            {
                return(
                    <Fragment>
                        <Navigation/>
                        <Container className="mt-5">
                            <Row>
                                { prototypeItems }
                            </Row>
                        </Container>     
                    </Fragment>
                )     
            }
        }
    
        else
        {
            return <Loading />
        }
    }

    
}

//View Prototype Component
const ViewPrototype: React.FC = (props:any) =>
{
    //LOGIC
    const session = useSession()
    const [state, setState] = useState({ id: '', title: '', description: '', link: '', privatekey: '', publickey: '', accesstoken: '', date: '', isLoaded: false, error: false })

    useEffect(() => 
    {
        let id = props.match.params.id
        setState({ ...state, id: id })

        let fetchPrototype = async() =>
        {
            try 
            {
                const response = await axios.get(`/api/prototype/view/${id}`)
                setState({ ...state, title: response.data.title, description: response.data.description, link: response.data.link, privatekey: response.data.privatekey, publickey: response.data.publickey, accesstoken: response.data.accesstoken, date: response.data.date, isLoaded: true })     
            } 
            
            catch (error) 
            {
                setState({ ...state, error: true, isLoaded: true }) 
            }
        } 

        fetchPrototype()
    }, [])

    //JSX
    if(session.hasError)
    {
        return <Redirect to='/auth/signin' />
    }

    else
    {
        if(state.error)
        {
            return <Error type="backward" message="Not Found" btn="Go Back" btnlink="/"/>
        }
    
        else
        {
            if(state.isLoaded)
            {
                return(
                    <Fragment>
                        <Navigation />
                        <Container style = {{ minWidth: '70%' }}>
                            <Jumbotron>
                                <Link to="/prototype/library" className="btn"><i className="fas fa-arrow-left"></i></Link>
                                <p className="logo text-center">{ state.title }</p>
                                <p className="lead fw-bold">{ `Start Date: ${state.date.slice(0,10)}` }</p>
                                <p className="lead fw-bold text-justify" style={{ overflowWrap: "break-word" }}>Description: { state.description }</p><br/>
                                <p className="lead fw-bold text-center">Prototype ID</p>
                                <input type="text" disabled value={ props.match.params.id } /><br/>
                                <p className="lead fw-bold text-center">SHA256 Access Token</p>
                                <input type="text" disabled value={ state.accesstoken } /><br/>
                                <a target="_blank" rel="noopener noreferrer" href={ state.link } className="btn">Prototype<i className="fas fa-chevron-right"></i></a>
                            </Jumbotron>
                        </Container>
                    </Fragment>
                )    
            }
            
            else
            {
                return <Loading />
            }
        }
    }
}

//Update Prototype Component
const UpdatePrototype: React.FC = (props:any) =>
{
    //LOGIC
    const session = useSession()
    const [state, setState] = useState({ title: '', description: '', link: '', isLoaded: false, error: false , alert: '' })
    const history = useHistory()

    useEffect(() => 
    {
        let id = props.match.params.id
        let fetchPrototype = async() =>
        {
            try 
            {
                const response = await axios.get(`/api/prototype/view/${id}`)
                setState({ ...state, title: response.data.title, description: response.data.description, link: response.data.link, isLoaded: true })     
            } 
            
            catch (error) 
            {
                setState({ ...state, error: true, isLoaded: true })  
            }
        } 

        fetchPrototype()
    }, [])

    let handleSubmit = async(e:any) =>
    {
        e.preventDefault()
        axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token')
    
        setState({ ...state, alert: 'Updating Prototype' })
        let id = props.match.params.id
        
        try 
        {
            const response = await axios.post(`/api/prototype/update/${id}`, state) 
            setState({ ...state, alert: response.data.msg })
        } 
        
        catch (error) 
        {
            if(error.response.status === 401)
            {
                localStorage.removeItem('token')
                history.push('/auth/signin')
            }

            else
            {
                setState({ ...state, alert: error.response.data.msg })
            }
        }
    }

    //JSX
    if(session.hasError)
    {
        return <Redirect to='/auth/signin' />
    }

    else
    {
        if(state.error)
        {
            return(<Error type="backward" message={ state.alert } btn="Go Back" btnlink="/" />)
        }
    
        else
        {
            if(state.isLoaded)
            {
                return (
                    <Fragment>
                        <Navigation/>
                        <form className="box" onSubmit={ handleSubmit } id="step1"> 
                            <p className="logo logobox">Update Prototype</p>
                            <input type="text" name="title" placeholder="Prototype Title" onChange={ (e) => setState({ ...state, title: e.target.value }) } value= { state.title } autoComplete="off" required />
                            <textarea name="description" placeholder="Description" onChange={ (e) => setState({ ...state, description: e.target.value }) } value= { state.description } autoComplete="off" required />
                            <input type="url" name="link" placeholder="Prototype Link" onChange={ (e) => setState({ ...state, link: e.target.value }) } value= { state.link } autoComplete="off" />
                            <p id="alert">{ state.alert }</p>
                            <button type="submit" className="btn">Update<i className="fas fa-chevron-right"></i></button>
                        </form>
                    </Fragment>   
                )            
            }
            
            else
            {
                return <Loading />             
            }
        }
    }
}

//Search Prototype Component
const SearchPrototype: React.FC = () =>
{
    //LOGIC
    const session = useSession()
    const [state, setState] = useState({ id: '', accesstoken: '',  title: '', description: '', link: '', date: '', alert: '' })
    const [show, setShow] = useState({ step1: true, step2: false })
    const history = useHistory()

    let handleSubmit = async(e:any) =>
    {
        e.preventDefault()
        setState({ ...state, alert: 'Searching Prototype' })
        
        axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token')

        try
        {
            const response = await axios.post('/api/prototype/search', state)
            setState({ ...state, title: response.data.title, description: response.data.description, link: response.data.link, date: response.data.date })
            setShow({ step1: false, step2: true })
        } 

        catch (error) 
        {
            if(error.response.status === 401)
            {
                localStorage.removeItem('token')
                history.push('/auth/signin')
            }

            else
            {
                setState({ ...state, alert: error.response.data.msg })
            }
        }  
    }

    //JSX
    if(session.hasError)
    {
        return <Redirect to = '/auth/signin' />
    }

    else
    {
        return (
            <Fragment>
                <Navigation/>
                <form className="box" onSubmit={ handleSubmit } style={{ display: show.step1? 'block': 'none' }}> 
                    <p className="logo logobox">Search Prototype</p>
                    <input type="text" placeholder="Prototype Id" onChange={ (e) => setState({ ...state, id: e.target.value }) } autoComplete="off" required />
                    <input type="text" placeholder="SHA256 Access Key" onChange={ (e) => setState({ ...state, accesstoken: e.target.value }) } autoComplete="off" required/>
                    <p id="alert">{ state.alert }</p>
                    <button type="submit" className="btn">Search<i className="fas fa-chevron-right"></i></button>
                </form>
                <Container style={{ minWidth: '70%', display: show.step2? 'block': 'none' }}>
                    <Jumbotron>
                        <p className="logo text-center">{ state.title }</p>
                        <p className="lead fw-bold">{ `Start Date: ${state.date.slice(0,10)}` }</p>
                        <p className="lead fw-bold text-justify" style={{ overflowWrap: "break-word" }}>Description: { state.description }</p><br/>
                        <a target="_blank" rel="noopener noreferrer" href={ state.link } className="btn">Prototype<i className="fas fa-chevron-right"></i></a>
                    </Jumbotron>
                </Container>
            </Fragment>   
        )
    }
}

//Export Statements
export { NewPrototype, Library, ViewPrototype, UpdatePrototype, SearchPrototype }