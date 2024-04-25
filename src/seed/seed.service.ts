import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response';

@Injectable()
export class SeedService {

 private readonly axios: AxiosInstance = axios;
  
  async fillDataSeed() {

    const {data}  = await axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1&offset=0')
      
    data.results.forEach((name, url)=> {

    })
    
    return data;

  }

  
}
