/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
 
  private readonly url: string = 'https://pokeapi.co/api/v2/pokemon?limit=650';

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}

  async executeSeed() {
    // Eliminar todos los pokemons
    await this.pokemonModel.deleteMany({})

    // Obtener todos los pokemons de la api de pokeapi.co
    const data = await this.http.get<PokeResponse>(this.url);

    // Arreglo de pokemons a insertar en la base de datos
    const pokemonToInsert: { name: string, no: number }[] = [];
    
    // Iterar sobre el arreglo de pokemons
    data.results.forEach(async({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });

    });

    // Insertar en la base de datos
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed executed';
  }
}
